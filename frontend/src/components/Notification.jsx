function Notification({ type = "info", message, onClose }) {
  if (!message) {
    return null;
  }

  return (
    <div className={`notification notification--${type}`}>
      <span>{message}</span>
      {onClose ? (
        <button type="button" className="notification__close" onClick={onClose}>
          x
        </button>
      ) : null}
    </div>
  );
}

export default Notification;
