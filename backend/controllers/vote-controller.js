import * as voteService from '../services/vote-service.js';

export async function castVote(req, res) {
  const { email, executiveCandidateId, supportingCandidateId, supportingStudentRollNo, supportingStudentName } = req.body;

  const result = await voteService.castVote(email, executiveCandidateId, supportingCandidateId, supportingStudentRollNo, supportingStudentName);

  res.status(result.status).json(
    result.success ? { message: result.message } : { error: result.error }
  );
}

export async function getResults(_req, res) {
  const results = await voteService.getResults();
  res.json(results);
}
