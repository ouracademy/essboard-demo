import { eventRepository } from "../repo";

export class EventService {
  static create(projectId, sessionNum, event) {
    eventRepository.insert({
      session: sessionNum,
      projectId,
      event
    });
  }
  static createFromArray(projectId, sessionNum, events = []) {
    const items = events.map(event => ({
      event,
      projectId,
      session: sessionNum
    }));
    return eventRepository.insert(items);
  }

  static getBySession(sessionNum, projectId) {
    return eventRepository
      .find({ session: sessionNum, projectId })
      .sort({ createdAt: 1 })
      .exec();
  }
}
