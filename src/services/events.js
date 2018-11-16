import { eventRepository } from "../repo";

export class EventService {
  static create(projectId, sessionNum, event) {
    eventRepository.insert({
      session: sessionNum,
      projectId,
      event
    });
  }
  static createFromArray(projectId, sessionNum, events) {
    events.forEach(event => {
      const { action, from, checkPointId, stateId, date } = event;
      EventService.create(projectId, sessionNum, {
        action,
        from,
        checkPointId,
        stateId,
        date
      });
    });
  }

  static getBySession(sessionNum, projectId) {
    return eventRepository
      .find({ session: sessionNum, projectId })
      .sort({ createdAt: 1 })
      .exec();
  }
}
