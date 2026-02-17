import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { useAuth } from "react-oidc-context";

const OrderForm = () => {
  const auth = useAuth();

  const addOrder = async (prevState, formData) => {
    setResponse(null);
	console.log(formData.get("customerId"));
    try {
      if (!apiUrl) throw new Error('Please enter the API URL to POST to.');
      const token = auth.user?.id_token;
      const res = await fetch(apiUrl, {
        method: 'POST',
        mode: 'cors', // ensure cross-origin requests
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : undefined
        },
        body: JSON.stringify(payload)
      });
      let data;
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }
      if (!res.ok) {
        return { success: false, message: (data && data.message) || (typeof data === 'string' ? data : 'Request failed') };
      }
      setResponse(data);
      return { success: true, message: "Order submitted successfully" };
    } catch (err) {
      console.error("Error submitting order:", err);
      return { success: false, message: err.message || String(err) };
    }
  }


  const defaultApi = import.meta.env.VITE_API_BASE ? `${import.meta.env.VITE_API_BASE}/order` : '/api/order';
  const [apiUrl, setApiUrl] = useState(defaultApi);
  const [response, setResponse] = useState(null);
  const initialState = {
    message: "",
    success: false,
  };
  const [state, formAction, isPending] = useActionState(addOrder, initialState);

  const [customerId, setCustomerId] = useState('10');
  const [items, setItems] = useState([
    { productId: 'p123', quantity: 2, price: 55 }
  ]);

  const payload = {
    customerId: String(customerId),
    items: items.map(i => ({
      productId: String(i.productId),
      quantity: Number(i.quantity),
      price: Number(i.price)
    }))
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 800, margin: '2rem auto', padding: '1rem' }}>
      <h1>Order Submitter</h1>
      <p>Enter order details.</p>

      <form action={formAction} style={{ display: 'grid', gap: '1rem' }}>
        <label style={{ display: 'grid', gap: '.25rem' }}>
          <span>API URL</span>
          <input
            type="text"
            placeholder="/api/order (proxied) or https://xyz.execute-api.mx-central-1.amazonaws.com/dev/order"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            required
          />
        </label>

        <label style={{ display: 'grid', gap: '.25rem' }}>
          <span>Customer ID</span>
          <input
            type="text"
			name="customerId"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            min={1}
            required
          />
        </label>

        <ItemTable items={items} setItems={setItems} />

        <div style={{ display: 'grid', gap: '.5rem' }}>
          <label style={{ display: 'grid', gap: '.25rem' }}>
            <span>Request Payload (read-only)</span>
            <textarea readOnly rows={8} value={JSON.stringify(payload, null, 2)} />
          </label>
        </div>

        <SubmitButton />

        {isPending ? "Loading..." : state.message}

        {state.message && (
          <div style={{ marginTop: '1rem', color: state.success ? '#a00' : 'red' }}>
            {state.message}
          </div>
        )}
      </form>

      {response && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Response</h3>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{typeof response === 'string' ? response : JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default OrderForm;

const SubmitButton = () => {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Submitting..." : "Submit"}
    </button>
  );
}

const ItemTable = ({ items, setItems }) => {
  const addItem = () => {
    setItems([...items, { productId: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    setItems(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  return (
    <>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Items</h2>
          <button type="button" onClick={addItem}>+ Add Item</button>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '.75rem', marginTop: '.5rem' }}>
        {items.map((item, idx) => (
          <div key={idx} style={{ border: '1px solid #ddd', borderRadius: 8, padding: '.75rem', display: 'grid', gap: '.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '.5rem', alignItems: 'end' }}>
              <label style={{ display: 'grid', gap: '.25rem' }}>
                <span>Product ID</span>
                <input
                  type="text"
                  value={item.productId}
                  onChange={(e) => updateItem(idx, 'productId', e.target.value)}
                  required
                />
              </label>

              <label style={{ display: 'grid', gap: '.25rem' }}>
                <span>Quantity</span>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                  required
                />
              </label>

              <label style={{ display: 'grid', gap: '.25rem' }}>
                <span>Price</span>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  value={item.price}
                  onChange={(e) => updateItem(idx, 'price', e.target.value)}
                  required
                />
              </label>

              <button type="button" onClick={() => removeItem(idx)} style={{ alignSelf: 'end' }}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </>);
}
