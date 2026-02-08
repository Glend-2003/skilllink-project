import React from 'react';

const SERVICES = [
  {
    id: '1',
    name: 'Reparación de fugas',
    description: 'Detección y reparación de fugas de agua',
    price: '₡10 000',
    duration: '1-2 horas',
  },
  {
    id: '2',
    name: 'Instalación de calentador',
    description: 'Instalación completa de calentador',
    price: '₡20 000',
    duration: '3-4 horas',
  },
];

export default function Provider() {
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <img
          src="https://i.pravatar.cc/150"
          alt="avatar"
          style={styles.avatar as React.CSSProperties}
        />
        <div>
          <div style={styles.name}>Juan Pérez</div>
          <div style={styles.category}>Plomería</div>
          <div>⭐ 4.8 (127 reseñas)</div>
          <div style={styles.available}>● Disponible ahora</div>
        </div>
      </div>
      {/* Description */}
      <div style={styles.description}>
        Plomero profesional con más de 10 años de experiencia en reparaciones residenciales y comerciales.
      </div>
      {/* Services */}
      <div style={styles.sectionTitle}>Servicios</div>
      <div>
        {SERVICES.map((item) => (
          <div key={item.id} style={styles.serviceCard}>
            <div style={styles.serviceName}>{item.name}</div>
            <div>{item.description}</div>
            <div style={styles.serviceInfo}>
              {item.duration} • {item.price}
            </div>
          </div>
        ))}
      </div>
      {/* Contact Button */}
      <button style={styles.button} onClick={() => window.location.href = '/chat'}>
        <span style={styles.buttonText}>Contactar</span>
      </button>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: 500,
    margin: '0 auto',
    padding: 16,
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: '50%',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  category: {
    color: '#555',
  },
  available: {
    color: 'green',
    marginTop: 4,
  },
  description: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  serviceCard: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  serviceName: {
    fontWeight: 'bold',
  },
  serviceInfo: {
    marginTop: 4,
    fontWeight: 600,
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
    border: 'none',
    width: '100%',
    cursor: 'pointer',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
};
