export const EventTargetMixin = (superclass, ...eventNames) => class extends superclass {
    constructor(...args) {
      super(args);
      const eventTarget = document.createDocumentFragment();
  
      this.addEventListener = (type, ...args) => {
        return eventTarget.addEventListener(type, ...args);
      }
  
      this.removeEventListener = (...args) => {
        return eventTarget.removeEventListener(...args);
      }
  
      this.dispatchEvent = (event) => {
        defineProperties(event, { currentTarget: this });
        if (!event.target) {
          defineProperties(event, { target: this });
        }
  
        const methodName = `on${event.type}`;
        if (typeof this[methodName] == "function") {
            this[methodName](event);
        }
  
        const retValue = eventTarget.dispatchEvent(event);
  
        if (retValue && this.parentNode) {
          this.parentNode.dispatchEvent(event);
        }
  
        defineProperties(event, { currentTarget: null, target: null });
  
        return retValue;
      }
    }
  };
  
  export class EventTarget extends EventTargetMixin(Object) {};