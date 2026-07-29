import * as nominationService from '../services/nomination-service.js';
import { generateNominationsReport } from '../services/export-service.js';

export async function getNominations(req, res) {
  const { execId, roleTitle } = req.params;
  const nominations = await nominationService.getNominations(Number(execId), roleTitle);
  res.json(nominations);
}

export async function nominate(req, res) {
  const { executiveCandidateId, roleTitle, email, name } = req.body;
  if (!executiveCandidateId || !roleTitle || !email || !name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const result = await nominationService.nominateSelf(Number(executiveCandidateId), roleTitle, email, name);
  if (result.error) {
    return res.status(403).json({ error: result.error });
  }
  if (result.alreadyNominated) {
    return res.status(409).json({ error: 'You are already nominated for this role', nomination: result.nomination });
  }
  generateNominationsReport().catch(err => console.error('Export failed:', err));
  res.status(201).json({ success: true });
}

export async function vote(req, res) {
  const { voterEmail, nominationId } = req.body;
  if (!voterEmail || !nominationId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const result = await nominationService.voteForNominee(voterEmail, Number(nominationId));
  if (result.error) return res.status(400).json({ error: result.error });
  generateNominationsReport().catch(err => console.error('Export failed:', err));
  res.json({ success: true });
}

export async function myNominations(req, res) {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const noms = await nominationService.getVoterNominationStatus(email);
  res.json(noms);
}

export async function withdraw(req, res) {
  const { nominationId, email } = req.body;
  if (!nominationId || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const result = await nominationService.withdrawNomination(Number(nominationId), email);
  if (result.error) return res.status(403).json({ error: result.error });
  generateNominationsReport().catch(err => console.error('Export failed:', err));
  res.json({ success: true });
}
