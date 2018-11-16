import { ProjectService, SessionService, EventService } from "./services";
import { eventsBySession1 } from "./events";
import { MemberService } from "./services/members";

const currentDate = new Date("2017-06-13T04:41:20");
ProjectService.create("diana", "ouracademy").then(project => {
  const projectId = project.key;
  MemberService.create(projectId, "arthur").then(() => {
    SessionService.create(projectId, 1, currentDate).then(session => {
      EventService.createFromArray(projectId, 1, eventsBySession1).then(
        events => {
          SessionService.getStatus(projectId, 1).then(status => {
            console.log(status);
          });
        }
      );
    });
  });
});
