export class Session {
  constructor(createdAt) {
    this.createdAt = createdAt;
    this.project = project;
  }

  end() {
    this.endDate = new Date();
    this.members = this.project.members;
  }

  get isFinished() {
    return !!this.endDate;
  }
}
