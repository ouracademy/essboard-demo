import { memberRepository } from "../repo";

export class MemberService {
  static create(projectId, name, role) {
    memberRepository.insert({
      projectId,
      name,
      role
    });
  }
}
