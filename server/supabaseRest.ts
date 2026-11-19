export function supabaseAuthHeaders(apiKey: string): Record<string, string> {
  // Supabase secret keys use the apikey header. Legacy service-role JWTs also use bearer auth.
  return apiKey.startsWith('eyJ')
    ? { apikey: apiKey, Authorization: 'Bearer ' + apiKey }
    : { apikey: apiKey };
}

export async function supabaseErrorStatus(response: Response): Promise<string> {
  const body: unknown = await response.json().catch(() => null);
  const code = body && typeof body === 'object' && 'code' in body ? body.code : null;
  // PostgreSQL SQLSTATE and PostgREST codes are safe to retain. Error messages can contain row data.
  const suffix = typeof code === 'string' && /^(?:[0-9A-Z]{5}|PGRST[0-9]{3})$/.test(code)
    ? ' (' + code + ')'
    : '';
  return 'HTTP ' + response.status + suffix;
}
