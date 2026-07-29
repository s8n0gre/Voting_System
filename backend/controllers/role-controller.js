import * as roleService from '../services/role-service.js';

export async function getRoles(_req, res) {
  const candidates = await roleService.getAllExecutiveCandidates();
  res.json(candidates);
}

export async function getSingleRole(req, res) {
  const { id } = req.params;
  const role = await roleService.getSupportingRoleById(Number(id));
  if (!role) return res.status(404).json({ error: 'Role not found' });
  res.json(role);
}

export async function getSupportingRole(req, res) {
  const { id } = req.params;
  const roles = await roleService.getSupportingRolesByExecutive(Number(id));
  res.json(roles);
}

export async function getSupportingRoleCandidates(req, res) {
  const { id } = req.params;
  const candidates = await roleService.getCandidatesBySupportingRole(Number(id));
  res.json(candidates);
}

export async function getStudents(req, res) {
  const { search } = req.query;
  const students = await roleService.getStudents(search);
  res.json(students);
}

export async function verifyStudent(req, res) {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  const student = await roleService.getStudentByEmail(email);
  res.json({ exists: !!student, student: student || null });
}

export async function getStatus(req, res) {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  const status = await roleService.getVoterStatus(email);
  res.json(status);
}
