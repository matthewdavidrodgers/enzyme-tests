import React from "react";
import { connect, Provider } from "react-redux";
import { createStore } from "redux";
import { shallow } from "enzyme";

interface State {
  value: number
}

const initialState: State = {
  value: 0
}

const reducer = (state: State=initialState, action: { type: string }) => {
  switch (action.type) {
    case "INCREMENT":
      return { ...state, value: state.value + 1 };
    case "DECREMENT":
      return { ...state, value: state.value - 1 };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

const myStore = createStore(reducer)

let Component = (props: { value: number }) => {
  return (
    <div>
      <span>Value:</span>
      <span>{props.value}</span>
    </div>
  );
}

const ConnectedComponent = connect((state: State) => {
  return { value: state.value }
})(Component);

describe("can dive through redux-connected components", () => {
  test("all as one tree", () => {
    const wrapper = shallow(
      <Provider store={myStore}>
        <ConnectedComponent />
      </Provider>
    ).childAt(0).dive();

    expect(wrapper.childAt(1).text()).toEqual(0);
  });

  test("using wrappingComponent", () => {
    const WrappingProvider = ({ children }: { children: React.ReactChild }) => <Provider store={myStore}>{children}</Provider>;
    const wrapper = shallow(
      <ConnectedComponent />,
      { wrappingComponent: WrappingProvider }
    );

    expect(wrapper.childAt(1).text()).toEqual(0);
  });
});

const CTX = React.createContext({ value: "SHOULD NOT SEE THIS" });

const ContextConsumer = () => {
  const ctxValue = React.useContext(CTX);

  return (
    <div>
      <span>Value:</span>
      <span>{ctxValue.value}</span>
    </div>
  );
}

describe("can dive through useContext", () => {
  test("as one tree", () => {
    const wrapper = shallow(
      <CTX.Provider value={{ value: "you should see this" }}>
        <ContextConsumer />
      </CTX.Provider>
    ).dive();

    expect(wrapper.childAt(1).text()).toEqual("you should see this");
  });

  test("using wrappingComponent", () => {
    const WrappingProvider = ({ children }: { children: React.ReactChild }) => <CTX.Provider value={{ value: "you should see this" }}>{children}</CTX.Provider>;
    const wrapper = shallow(
      <ContextConsumer />,
      { wrappingComponent: WrappingProvider }
    );

    expect(wrapper.childAt(1).text()).toEqual("you should see this");
  });
});