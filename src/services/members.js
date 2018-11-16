import { memberRepository } from "../repo";

export class MemberService {
  static create(projectId, name, role = "colaborator") {
    return memberRepository.insert({
      projectId,
      name,
      role
    });
  }
}
