import {
  createEventStore,
  eventStore,
  dispatch,
  getCurrentState,
  takeSnapshot,
  snapshots
} from "./index";
import { MockDate } from "../MockDate";

const reducer = (acc, action) => [...acc, action.name];

describe("eventStore", () => {
  beforeEach(() => {
    createEventStore();
    dispatch({
      type: "ADD_TODO",
      name: "Cook",
      createdAt: new Date(2018, 10, 16)
    });
    dispatch({
      type: "ADD_TODO",
      name: "Wash the dishes",
      createdAt: new Date(2018, 10, 17)
    });
  });

  it("should get two events in event store", () => {
    expect(eventStore).toHaveLength(2);
  });

  it("getCurrentState", () => {
    expect(getCurrentState(new Date(2018, 10, 16), reducer)).toEqual(["Cook"]);
    expect(getCurrentState(new Date(2018, 10, 17), reducer)).toEqual([
      "Cook",
      "Wash the dishes"
    ]);
  });

  describe("when taking a snapshot", () => {
    let snapshot;
    const currentState = ["Cook", "Wash the dishes"];

    beforeEach(() => {
      MockDate.set(new Date(2018, 10, 18));
      snapshot = takeSnapshot(reducer);
    });

    afterEach(() => {
      MockDate.reset();
    });

    it("has createdDate equals to currentDate", () => {
      expect(snapshot.createdAt).toEqual(new Date(2018, 10, 18));
    });
    it("contains current state", () => {
      expect(snapshot.state).toEqual(currentState);
    });
    it("getCurrentState", () => {
      expect(getCurrentState(new Date(2018, 10, 19), reducer)).toEqual([
        "Cook",
        "Wash the dishes"
      ]);
    });

    describe("when taking another snapshot", () => {
      it("should contains 2 snapshots", () => {
        dispatch({
          type: "ADD_TODO",
          name: "Take vacations",
          createdAt: new Date(2018, 10, 20)
        });

        MockDate.set(new Date(2018, 10, 18));
        const newSnap = takeSnapshot(reducer);

        expect(snapshots).toHaveLength(2);
        expect(newSnap.state).toEqual([
          "Cook",
          "Wash the dishes",
          "Take vacations"
        ]);
      });
    });
  });
});
