import * as authService from '../services/auth-service.js';

export async function register(req, res) {
  const { email, password } = req.body;
  const result = await authService.registerUser(email, password);
  res.status(result.status).json(
    result.success ? { message: 'Account created successfully', name: result.name } : { error: result.error }
  );
}

export async function login(req, res) {
  const { email, password } = req.body;
  const result = await authService.loginUser(email, password);
  res.status(result.status).json(
    result.success ? { message: 'Signed in successfully', name: result.name } : { error: result.error }
  );
}
