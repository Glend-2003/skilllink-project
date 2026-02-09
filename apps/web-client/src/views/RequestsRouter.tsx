import React from 'react';
import { useRole } from '../context/RoleContext';
import MyRequests from './my-requests';
import ProviderRequests from './provider/provider-requests';

export default function RequestsRouter() {
  const { isProvider } = useRole();

  // If user is a provider, show provider requests (requests received)
  // Otherwise, show client requests (requests sent)
  return isProvider ? <ProviderRequests /> : <MyRequests />;
}
