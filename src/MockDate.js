export const MockDate = {
  realDate: Date,
  set(date) {
    /*eslint no-global-assign:off*/
    global.Date = class extends Date {
      constructor() {
        return date;
      }
    };
  },
  reset() {
    global.Date = this.realDate;
  }
};
