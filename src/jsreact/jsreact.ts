// jsreact v1.1
import type React from "react";

// utils
/** Replace `document.body` with the `message` while avoiding XSS. */
function replaceDocumentWithError(message: string, throwError: boolean, rootElement: HTMLElement) {
  for (const child of [...rootElement.childNodes]) child.remove();
  const h3 = document.createElement("h3");
  h3.className = "jsreact-error";
  h3.style.fontFamily = "Consolas, sans-serif";
  h3.style.whiteSpace = "pre-wrap";
  h3.innerText = message;
  rootElement.append(h3);
  if (throwError) throw new Error(message);
}
/** NOTE: bundler-agnostic env */
// @ts-ignore
const env = typeof import.meta !== "undefined" && import.meta.env ? import.meta.env : (typeof process !== "undefined" ? process.env : {});
function mapEnvString<T = string|undefined>(value: string|undefined, mapping: (v: string|undefined) => T = v => v as T): T {return mapping(value)}
function parseEnvNumber(name: string, value: string|undefined): number|undefined {
  if ((value ?? "") === "") return undefined;
  const number = parseInt(value ?? "");
  if (!Number.isNaN(number)) return number;
  replaceDocumentWithError(`Invalid number in env: ${name}=${value}`, true, document.body);
}
function parseEnvBoolean(name: string, value: string|undefined): boolean|undefined {
  if ((value ?? "") === "") return undefined;
  if (value === "1" || value === "true" || value === "yes" || value === "y" || value === "Y") return true;
  if (value === "0" || value === "false" || value === "no" || value === "n" || value === "N") return false;
  replaceDocumentWithError(`Invalid boolean in env: ${name}=${value}`, true, document.body);
}

// env
const IS_PRODUCTION = parseEnvBoolean("JSREACT_IS_PRODUCTION", env.JSREACT_IS_PRODUCTION) ?? (env.MODE === "production");
const WHY_DID_YOU_RENDER_PREFIX = mapEnvString(env.JSREACT_WHY_DID_YOU_RENDER_PREFIX);
const WHY_DID_YOU_RENDER_VERBOSE = parseEnvBoolean("JSREACT_WHY_DID_YOU_RENDER_VERBOSE", env.JSREACT_WHY_DID_YOU_RENDER_VERBOSE) ?? false;
const WARN_RENDER_MS = parseEnvNumber("JSREACT_WARN_RENDER_MS", env.JSREACT_WARN_RENDER_MS) ?? 100;
const INFINITE_LOOP_COUNT = parseEnvNumber("JSREACT_INFINITE_LOOP_COUNT", env.JSREACT_INFINITE_LOOP_COUNT);
const INFINITE_LOOP_PAUSE = parseEnvBoolean("JSREACT_INFINITE_LOOP_PAUSE", env.JSREACT_INFINITE_LOOP_PAUSE) ?? false;
const SLOW_EVENT_HANDLERS = parseEnvBoolean("JSREACT_SLOW_EVENT_HANDLERS", env.JSREACT_SLOW_EVENT_HANDLERS) ?? false;
const SLOW_MEMO = parseEnvBoolean("JSREACT_SLOW_MEMO", env.JSREACT_SLOW_MEMO) ?? false;
const MAP_ONCHANGE_TO_ONINPUT = parseEnvBoolean("JSREACT_MAP_ONCHANGE_TO_ONINPUT", env.JSREACT_MAP_ONCHANGE_TO_ONINPUT) ?? false;
const CONTROLLED_HTML_INPUTS = parseEnvBoolean("JSREACT_CONTROLLED_HTML_INPUTS", env.JSREACT_CONTROLLED_HTML_INPUTS) ?? false;
const ALWAYS_RENDER_MEMO = parseEnvBoolean("JSREACT_ALWAYS_RENDER_MEMO", env.JSREACT_ALWAYS_RENDER_MEMO) ?? false;

// types
export type MutableRef<T> = {current: T};
export type Ref<T> = MutableRef<T> | ((value: T) => void) | null;
export type Value = string | bigint | number | boolean | null | undefined | void;
export type JsxKey = Value;
export type JsxProps = {children?: JsReactNode, key?: JsxKey};
export type DOMProps<R = any> = JsxProps & Omit<React.DOMAttributes<R>, "children"> & {
  ref?: Ref<R | null>;
  className?: string[] | string;
  style?: React.CSSProperties & {[k in `--${string}`]: number | string};
  htmlFor?: string;
  value?: string;
  [k: string]: any;
};

export type PropsWithChildren<P = {}> = (P extends {children: any} ? P & Omit<JsxProps, "children"> : P) & JsxProps;
export type FunctionComponent<P = {}> = (props: PropsWithChildren<P>, context?: any) => JsReactNode;
export type FC<P = {}> = FunctionComponent<P>;
export type ForwardFn<P = {}, R = any> = React.ForwardRefRenderFunction<R, P>;

export type ForwardRefComponent<P = {}, R = any> = ForwardFn<P, R> & { $$typeof: symbol };
export type FragmentElement = { $$typeof: symbol };
export type Context<T> = NamedExoticComponent & {
  Provider: NamedExoticComponent<PropsWithChildren<{value: T}>>;
  Consumer: NamedExoticComponent<{children: JsReactNode | ((value: T) => JsReactNode)}>;
  _currentValue: T;
};
export type JSXElementConstructor<P = any> = {
  (props: P): JsReactNode;
  $$typeof?: symbol;
  displayName?: string;
};
export type ElementType<P = any> = string | JSXElementConstructor<P>;
export type JsReactNode = number | bigint | boolean | null | undefined | JsReactElement | JsReactNode[];

// private types
type NamedExoticComponent<P = any> = {
  (props: P): JsReactNode;
  readonly $$typeof: symbol;
  displayName?: string;
};
const TYPE_LEGACY_ELEMENT = Symbol.for("react.element");
export const TYPE_ELEMENT = Symbol.for("react.transitional.element");
export type JsReactElement<P = any, T extends string | symbol | JSXElementConstructor<P> = string | symbol | JSXElementConstructor<P>> = {
  /** TYPE_ELEMENT_TYPE | TYPE_PORTAL */
  $$typeof: symbol;
  /** string | symbol | Component | NamedExoticComponent */
  type: T;
  props: PropsWithChildren<P>;
  key?: string | null;
  source?: {
    fileName: string;
    lineNumber: number;
    columnNumber: number;
  } | null;
};

// legacy Component class - must be callable as both `new Component()` and `Component()`, AND extendable via `extends Component<...>`
const LEGACY_COMPONENT_STATIC_SUPPORTED: Record<string, boolean> = {
  contextType: true,
  contextTypes: false,
  defaultProps: true,
  getDerivedStateFromProps: true,
  getDerivedStateFromError: false,
};
const LEGACY_COMPONENT_SUPPORTED: Record<string, boolean> = {
  componentDidCatch: false,
  componentDidMount: true,
  componentDidUpdate: true,
  componentWillMount: false,
  componentWillReceiveProps: false,
  componentWillUpdate: false,
  componentWillUnmount: true,
  forceUpdate: true,
  getSnapshotBeforeUpdate: false,
  render: true,
  setState: true,
  shouldComponentUpdate: false,
  UNSAFE_componentWillMount: false,
  UNSAFE_componentWillReceiveProps: false,
  UNSAFE_componentWillUpdate: false,
};
type ComponentClass<P = {}, S = {}, SS = any> = {
  readonly contextType?: Context<any>;
  readonly defaultProps?: Partial<P>;
  getDerivedStateFromProps(props: P, state: S): Partial<P> | null;
  // callable
  new <P = {}, S = {}, SS = any>(props: P, _context?: any): ComponentInstance<P, S, SS>;
  <P = {}, S = {}, SS = any>(props: P, _context?: any): ComponentInstance<P, S, SS>;
  prototype: ComponentInstance<P, S, SS>;
};
type ComponentInstance<P = {}, S = {}, SS = any> = React.Component<P, S, SS>
type Writable<T> = { -readonly [K in keyof T]: T[K] };
function ComponentImpl<P = {}, S = {}, SS = any>(this: ComponentInstance<P, S, SS>, props: P, _context?: any) {
  if (_context != null) throw new Error("Not implemented: Component(props, context)");
  if (!(this instanceof ComponentImpl)) {
    return new (ComponentImpl as any)(props, _context);
  }
  (this as Writable<ComponentInstance<P, S, SS>>).props = props;
  this.state = this.state ?? {};
};
ComponentImpl.prototype.setState = function<P = {}, S = {}, _SS = any>(
  _newState: S | Pick<S, keyof S> | ((prevState: Readonly<S>, props: Readonly<P>) => S | Pick<S, keyof S> | null) | null,
  _callback: any,
) {
  throw new Error("BUG: Component.setState is not set");
}
ComponentImpl.prototype.forceUpdate = function<P = {}, S = {}, SS = any>(): void {
  throw new Error("BUG: Component.forceUpdate is not set");
}
ComponentImpl.prototype.render = function(): JsReactNode {return null}
export const Component = ComponentImpl as ComponentClass;
function isComponentClass(type: any): type is ComponentClass {
  return typeof type === "function" && type.prototype != null && typeof type.prototype.render === "function";
}
/** NOTE: legacy api, we don't care if it's wrong for multiple roots (does React even support multiple roots?) */
function findDOMNode_Component(classComponent: ComponentInstance, component: VirtNode): VirtNode | undefined {
  if (component.instance === classComponent) return component;
  for (const c of Object.values(component.children)) {
    const search = findDOMNode_Component(classComponent, c);
    if (search != null) return search;
  }
}
function findDOMNode_firstElement(component: VirtNode | undefined) {
  const element = component?.element;
  if (element != null) return element;
  const firstChild = Object.values(component!.children)[0];
  if (firstChild == null) return null;
  return findDOMNode_firstElement(firstChild);
}
export function findDOMNode(classComponent: ComponentInstance) {
  const component = $component;
  const virtNode = findDOMNode_Component(classComponent, component.root);
  return findDOMNode_firstElement(virtNode);
}
/** NOTE: libraries use this to detect React features... */
export const version = 19;
export function isValidElement(value: any): value is JsReactElement {
  return value != null && typeof value === "object" && "$$typeof" in value;
}
export function createElement(type: ElementType, props: JsReactElement<PropsWithChildren>["props"] | null = null, ...argChildren: JsReactNode[]): JsReactElement {
  props = props ?? {};
  const { key, ...rest } = props;
  const children = "children" in props
    ? props.children
    : argChildren.length === 1 ? argChildren[0] : (argChildren.length === 0 ? null : argChildren);
  return { $$typeof: TYPE_ELEMENT, type, key: key as JsReactElement["key"], props: {...rest, children} };
}
export function cloneElement(node: JsReactNode, childProps: DOMProps | null): JsReactNode {
  if (isIterable(node)) throw new Error("Not implemented: cloneElement(array)");
  if (isValidElement(node)) {return {...node, props: {...node.props as object, ...childProps}}}
  return node;
}
export function typeOf(value: any): symbol|undefined {
  if (typeof value === "object" && value !== null) {
    const $$typeof = (value as JsReactElement).$$typeof;
    if ($$typeof === TYPE_LEGACY_ELEMENT || $$typeof === TYPE_ELEMENT) {
      const type = (value as JsReactElement).type;
      if (typeof type === "symbol") return type;
      else return (type as NamedExoticComponent|undefined)?.$$typeof as symbol|undefined;
    } else { /* TYPE_PORTAL */
      return $$typeof;
    }
  }
  return undefined;
}
// Fragment
export const Fragment = Symbol.for("react.fragment");
// memo()
const EXOTIC_MEMO = Symbol.for("react.memo");
type MemoComponent = NamedExoticComponent & {$$arePropsEqual: (a: object, b: object) => boolean};
function defaultArePropsEqual(a: Record<string, any>, b: Record<string, any>) {
  /* NOTE: https://jsperf.app/qiduza */
  for (let key of Object.keys(a)) {
    if (!Object.is(a[key], b[key])) return false;
  }
  for (let key of Object.keys(b)) {
    if (!Object.is(a[key], b[key])) return false;
  }
  return true;
}
function _makeExoticComponent<P = {}>($$typeof: symbol, render?: JSXElementConstructor<PropsWithChildren<P>>): NamedExoticComponent<P> {
  if (render == null) {
    render = ((props: PropsWithChildren<P>) => props.children);
    Object.defineProperty(render, "name", { value: "", configurable: true });
  }
  render.$$typeof = $$typeof;
  return render as NamedExoticComponent<P>;
}
export function memo(component: JSXElementConstructor<any>, arePropsEqual: (a: object, b: object) => boolean = defaultArePropsEqual) {
  if (ALWAYS_RENDER_MEMO) return component;
  const memoComponent = ((props: any) => createElement(component, props)) as MemoComponent;
  memoComponent.$$arePropsEqual = arePropsEqual;
  memoComponent.displayName = component.displayName || component.name;
  return _makeExoticComponent(EXOTIC_MEMO, memoComponent);
}
type CachedChildOrder = VirtNode[];
// forwardRef()
const EXOTIC_FORWARD_REF = Symbol.for("react.forward_ref");
export function forwardRef<R = any, P = {}>(render: ForwardFn<P, R>): ForwardRefComponent<P, R> {
  const forwardRefComponent = render as ForwardRefComponent<P, R>;
  forwardRefComponent.displayName = render.displayName || render.name;
  forwardRefComponent.$$typeof = EXOTIC_FORWARD_REF;
  return forwardRefComponent;
}
// createContext()
const EXOTIC_CONTEXT_PROVIDER = Symbol.for("react.context");
const EXOTIC_CONTEXT_CONSUMER = Symbol.for("react.consumer");
export function createContext<T>(defaultValue: T): Context<T> {
  const context = _makeExoticComponent(EXOTIC_CONTEXT_PROVIDER) as Context<T>;
  context._currentValue = defaultValue;
  context.Provider = context;
  context.Consumer = _makeExoticComponent(EXOTIC_CONTEXT_CONSUMER, ({children}) => {
    if (typeof children !== "function") throw new Error("Context.Consumer expects a function as its child");
    const value = useContext(context);
    return children(value);
  });
  return context;
}
export function useContext<T>(context: Context<T>): T {
  return context._currentValue;
}
// createPortal()
const TYPE_PORTAL = Symbol.for("react.portal");
type PortalElement = JsReactElement<Element, JSXElementConstructor>;
export function createPortal(children: JsReactNode, node: Element, key?: JsReactElement["key"]): PortalElement {
  return { $$typeof: TYPE_PORTAL, type: () => children, key, props: node as any };
}
// React.Children
function Children$forEach(children: JsReactNode, fn: (child: JsReactNode) => void) {
  if (isIterable(children)) {
    for (const c of children) Children$forEach(c, fn);
  } else fn(children);
}
function Children$toArrayExcludingNullsy(children: JsReactNode, out: JsReactNode[]) {
  if (isIterable(children)) {
    for (const c of children) Children$toArrayExcludingNullsy(c, out);
  } else if (children != null) out.push(children);
}
function Children$toArrayExcludingNullsyAndBoolean(children: JsReactNode, out: JsReactNode[]) {
  if (isIterable(children)) {
    for (const c of children) Children$toArrayExcludingNullsyAndBoolean(c, out);
  } else if (children != null && typeof children != "boolean") out.push(children);
}
export const Children = {
  count(children: JsReactNode): number {
    let index = 0;
    Children$forEach(children, (_child) => {index++});
    return index;
  },
  forEach(children: JsReactNode, fn: (child: JsReactNode, index: number) => any, thisArg?: any): undefined {
    let index = 0;
    Children$forEach(children, (child) => {fn.call(thisArg, child, index++)});
  },
  map(children: JsReactNode, fn: (child: JsReactNode, index: number) => any, thisArg?: any): JsReactNode {
    if (children == null) return children; /* NOTE: special case per the spec */
    let index = 0;
    const acc: JsReactNode[] = [];
    Children$forEach(children, (child) => {
      Children$toArrayExcludingNullsy(fn.call(thisArg, child, index++), acc);
    });
    return acc;
  },
  only(children: JsReactNode): JsReactNode {
    if (!isValidElement(children)) throw new Error("Children.only expects a single valid React element");
    return children;
  },
  toArray(children: JsReactNode): JsReactNode[] {
    const acc: JsReactNode[] = [];
    Children$toArrayExcludingNullsyAndBoolean(children, acc);
    return acc;
  },
}

// implementation
type VirtNode = {
  /** user input */
  node: JsReactNode;
  /** the HTML or SVG element derived from JSX */
  element: Element | SVGElement | undefined;
  /** used to implement ComponentClass, RootHooks on root component */
  instance: ComponentInstance<any, any> | RootHooks | CachedChildOrder | undefined;
  /** used by `useId()` on RootComponent, else used to implement hooks */
  hookIndex: number;
  /** used to catch errors */
  prevHookIndex: number;
  /** `prevClassNames: string[]` for ElementComponent, else `hooks: Hook[]` */
  hooks: Hook[] | string[];
  /** the key that the component was rendered as */
  key: string;
  /** map<key, ChildState> - TODO: maybe use Map for performance? */
  children: Record<string, VirtNode>;
  /** used to generate default keys for children */
  childrenIndex: number;
  /** used to implement memo() components */
  memoChildren: JsReactNode[];
  /** used to implement HTML event listeners */
  prevEventHandlers: Record<string, PrevEventHandler|undefined>;
  /** used to implement hooks and rerender() */
  root: VirtNode;
  /** used to implement rerender() */
  flags: number;
};
type PrevEventHandler<T = Event> = {
  raw: ReactEventHandler<T> | null | undefined;
  mapped: EventHandler<T> | null | undefined;
};
const FLAGS_TAB_LOST_FOCUS = 32;
const FLAGS_RERENDERED_THIS_FRAME = 16;
const FLAGS_IS_RENDERING = 8;
const FLAGS_WILL_RERENDER = 4;
const FLAGS_COMPONENT_STATE_IS_DIRTY = 2;
const FLAGS_GC = 1;
function _printFlags(flags: number) {
  const acc: string[] = [];
  if (flags & FLAGS_GC) acc.push("FLAGS_GC");
  if (flags & FLAGS_COMPONENT_STATE_IS_DIRTY) acc.push("FLAGS_COMPONENT_STATE_IS_DIRTY");
  if (flags & FLAGS_WILL_RERENDER) acc.push("FLAGS_WILL_RERENDER");
  if (flags & FLAGS_IS_RENDERING) acc.push("FLAGS_IS_RENDERING");
  if (flags & FLAGS_RERENDERED_THIS_FRAME) acc.push("FLAGS_RERENDERED_THIS_FRAME");
  if (flags & FLAGS_TAB_LOST_FOCUS) acc.push("FLAGS_TAB_LOST_FOCUS");
  return `{${acc.join(", ")}}`;
};
void _printFlags; /* disable unused warning */
// apply DOM props
function setFromHereString(str: string, splitChar = "\n"): Set<string> {return new Set(str.trim().split(splitChar))}
const PASSIVE_EVENTS = setFromHereString(`touchstart,touchmove,wheel`, ',');
const HTML_BOOLEAN_ATTRIBUTES = setFromHereString(`
hidden
inert
disabled
readonly
required
checked
multiple
selected
autofocus
formnovalidate
autoplay
controls
loop
muted
playsinline
open
async
defer
nomodule
reversed
allowfullscreen
itemscope
default
ismap
`);
const UNITLESS_CSS_PROPS = setFromHereString(`
animation
animationIterationCount
boxFlex
boxFlexGroup
boxOrdinalGroup
columnCount
columns
fillOpacity
flex
flexGrow
flexShrink
floodOpacity
fontSizeAdjust
fontVariationSettings
gridArea
gridColumn
gridColumnEnd
gridColumnStart
gridRow
gridRowEnd
gridRowStart
hyphenateLimitChars
initialLetter
lineClamp
lineHeight
mathDepth
maxLines
MsHyphenateLimitChars
msHyphenateLimitChars
MsHyphenateLimitLines
msHyphenateLimitLines
opacity
order
orphans
readingOrder
scale
shapeImageThreshold
stopOpacity
strokeDasharray
strokeDashoffset
strokeMiterlimit
strokeOpacity
strokeWidth
tabSize
WebkitLineClamp
webkitLineClamp
widows
zIndex
`);
type EventHandler<T = Event> = ((event: T, ...args: any[]) => void) | null | undefined;
type SyntheticEvent<T = Event> = T & {
  nativeEvent: T;
  isDefaultPrevented: () => boolean;
  isPropagationStopped: () => boolean;
  persist: () => void;
  isPersistent: () => boolean;
};
type ReactEventHandler<T = Event> = EventHandler<SyntheticEvent<T>>;
function _makeReactEventHandler(callback: ReactEventHandler): EventHandler<Event> {
  if (callback == null) return callback;
  return ((event: SyntheticEvent) => {
    event.nativeEvent = event;
    event.isDefaultPrevented = () => event.defaultPrevented;
    event.isPropagationStopped = () => event.cancelBubble ?? false;
    callback(event);
  }) as EventHandler;
}
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
function createElementAndApplyDOMProps(component: VirtNode, desiredElementType: string, props: DOMProps, isSvgElement: boolean) {
  const {prevEventHandlers} = component;
  let element = component.element;
  if (element == null) {
    if (isSvgElement) element = document.createElementNS(SVG_NAMESPACE, desiredElementType);
    else element = document.createElement(desiredElementType);
    component.element = element;
  }
  // style
  const {ref, key, htmlFor, style, className, children, ...rest} = props;
  if (style != null) {
    for (const [k, v] of Object.entries(style)) {
      /* NOTE: pass through `--${string}` and `-${string}` directly, else add "px" to non-unitless numbers. */
      if (k.startsWith("-")) (element as HTMLElement).style.setProperty(k, v);
      else if (UNITLESS_CSS_PROPS.has(k)) (element as HTMLElement).style[k as any] = v;
      else (element as HTMLElement).style[k as any] = (typeof v === "number" ? `${v}px` : v);
    }
  }
  // className
  const prevClassList = component.hooks as string[];
  const newClassList = Array.isArray(className) ? className : (className ? className.split(" ") : []);
  for (const newClass of newClassList) element.classList.add(newClass);
  const newClassList_set = new Set(newClassList);
  for (const prevClass of prevClassList) {
    if (!newClassList_set.has(prevClass)) element.classList.remove(prevClass);
  }
  component.hooks = newClassList;
  // attributes/events
  if (desiredElementType === "input" || desiredElementType === "textarea") {
    if (MAP_ONCHANGE_TO_ONINPUT) {
      const {onInput, onChange} = rest;
      if (onChange) {
        rest.onInput = (event) => {
          onInput?.(event);
          onChange?.(event);
        }
        delete rest.onChange;
      }
    }
    if ("value" in rest) {
      const value = rest.value ?? "";
      if (desiredElementType === "textarea") {
        element.textContent = value; /* NOTE: set the default value */
        (element as HTMLTextAreaElement).value = value;
      } else {
        element.setAttribute("value", value); /* NOTE: set the default value */
        if (CONTROLLED_HTML_INPUTS) (element as HTMLInputElement).value = value;
      }
      delete rest.value;
    }
    if ("checked" in rest) {
      const checked = Boolean(rest.checked);
      if (checked) element.setAttribute("checked", "");
      else element.removeAttribute("checked");
      if (CONTROLLED_HTML_INPUTS) (element as HTMLInputElement).checked = checked;
      delete rest.checked;
    }
  }
  /* NOTE: we need bubbling for `onFocus` and `onBlur`, and in practice all browsers support `focusin` and `focusout` */
  if ("onFocus" in rest) {
    rest.onFocusIn = rest.onFocus;
    delete rest.onFocus;
  }
  if ("onBlur" in rest) {
    rest.onFocusOut = rest.onBlur;
    delete rest.onBlur;
  }
  for (const [key, value] of Object.entries(rest)) {
    if (key.startsWith("on") && key.length > 2) {
      const isCapturing = key.endsWith("Capture");
      const type = key.slice(2, isCapturing ? -7 : undefined).toLowerCase();
      const prevEventHandler = prevEventHandlers[key];
      const rawEventHandler = value as ReactEventHandler;
      const mappedEventHandler = _makeReactEventHandler(rawEventHandler);
      prevEventHandlers[key] = {raw: rawEventHandler, mapped: mappedEventHandler};
      if (prevEventHandler?.raw == rawEventHandler) continue;
      if (prevEventHandler?.mapped != null) element.removeEventListener(type, prevEventHandler.mapped);
      if (mappedEventHandler != null) {
        element.addEventListener(type, mappedEventHandler, {
          passive: PASSIVE_EVENTS.has(type),
          capture: isCapturing,
        });
      }
    } else {
      if (HTML_BOOLEAN_ATTRIBUTES.has(key.toLowerCase())) {
        /* NOTE: considered true if present with any value */
        if (value) element.setAttribute(key, "");
        else element.removeAttribute(key);
      } else {
        /* NOTE: considered true if the value is set to "true" */
        if (value != null) element.setAttribute(key, String(value ?? ""));
        else element.removeAttribute(key);
      }
    }
  }
  if (htmlFor != null) element.setAttribute("for", htmlFor);
  else element.removeAttribute("for");
}

// render
function isIterable(value: any): value is Iterable<any> {
  return typeof value !== "string" && typeof value?.[Symbol.iterator] === "function";
}
function setRef<T>(ref: Ref<T> | undefined | null, value: T) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}
function jsreact$renderJsxChildren(parent: VirtNode, child: JsReactNode, childOrder: VirtNode[], parentIsSvgElement: boolean, isUnderMemo: boolean) {
  // recurse
  if (isIterable(child)) {
    for (const c of child) jsreact$renderJsxChildren(parent, c as JsReactNode, childOrder, parentIsSvgElement, isUnderMemo);
    return;
  }
  // get component state
  let keyLeft: Value;
  let keyRight: string;
  let $$typeof: symbol|undefined;
  if (isValidElement(child)) {
    keyLeft = child.key;
    const childType = child.type;
    if (typeof childType === "string") {
      keyRight = childType;
    } else {
      const displayName = (childType as NamedExoticComponent).displayName;
      keyRight = displayName || (childType as JSXElementConstructor).name;
      $$typeof = typeOf(child);
      if ($$typeof) keyRight = keyRight ? `${keyRight}_${String($$typeof)}` : String($$typeof);
    }
  } else {
    keyRight = (child === null ? "null" : typeof child) + "$";
  }
  if (keyLeft == null) {
    keyLeft = parent.childrenIndex++;
  } else {
    keyLeft = keyLeft;
  }
  const key = `${keyLeft}_${keyRight}`;
  let component = parent.children[key];
  if (component == null) {
    component = {
      node: undefined,
      element: undefined,
      instance: undefined,
      prevHookIndex: 0,
      hookIndex: 0,
      hooks: [],
      key,
      children: {},
      childrenIndex: 0,
      memoChildren: [],
      prevEventHandlers: {},
      root: parent.root,
      flags: 0,
    };
    parent.children[key] = component;
  }
  parent.memoChildren.push(child);
  const memoChildren = component.memoChildren;
  component.memoChildren = [];
  component.childrenIndex = 0;
  component.prevHookIndex = component.hookIndex;
  component.hookIndex = 0;
  const isComponentStateDirty = component.flags & FLAGS_COMPONENT_STATE_IS_DIRTY;
  component.flags = parent.flags & FLAGS_GC; /* NOTE: parent.flags can get set concurrently */
  // run user code
  $component = component;
  let leaf: JsReactNode = child;
  let desiredElementType = "";
  let context: Context<any>|undefined;
  let prevContextValue: any;
  isUnderMemo = isUnderMemo && !isComponentStateDirty;
  let cachedChildOrderStart: number|undefined;
  if (!isValidElement(leaf)) {
    // Value
    if (typeof leaf === "boolean" || leaf == null) return;
    desiredElementType = "Text";
  } else {
    const leafType = leaf.type;
    if (typeof leafType === "string") {
      // HTML or SVG element
      desiredElementType = leafType;
    } else if (typeof leafType === "symbol") {
      // Fragment
      leaf = leaf.props.children;
    } else {
      // FC or exotic component
      switch ($$typeof) {
      case TYPE_PORTAL: {
        const portal = leaf as unknown as PortalElement;
        leaf = portal.type(undefined);
        component.element = portal.props as Element; /* NOTE: I don't think anyone is portaling into an svg element here */
        childOrder = [];
      } break;
      case EXOTIC_MEMO:
        const prevNode = component.node as JsReactElement|null;
        isUnderMemo = prevNode != null && (leafType as MemoComponent).$$arePropsEqual(prevNode.props, leaf.props as object);
        if (isUnderMemo && !SLOW_MEMO) {
          for (const child of component.instance as CachedChildOrder) childOrder.push(child);
          setMemoComponentDescendantsGcFlag(component);
          return;
        }
        cachedChildOrderStart = childOrder.length;
        /* NOTE: fallthrough */
      case EXOTIC_CONTEXT_PROVIDER:
      case EXOTIC_CONTEXT_CONSUMER:
      case undefined: {
        if ($$typeof === EXOTIC_CONTEXT_PROVIDER) {
          context = (leaf as JsReactElement).type as Context<any>;
          prevContextValue = context._currentValue;
          context._currentValue = (leaf as JsReactElement).props.value;
        }
        if (isUnderMemo) {
          leaf = memoChildren;
          component.hookIndex = component.prevHookIndex;
          break;
        }
        if (isComponentClass(leafType)) {
          // class props
          for (const key of Object.keys(leafType)) {
            if (LEGACY_COMPONENT_STATIC_SUPPORTED[key] === false) {
              console.error("Component has:", Object.keys(leafType).filter(v => v in LEGACY_COMPONENT_STATIC_SUPPORTED))
              throw `Not implemented: Component.${key}`;
            }
          }
          const {contextType, defaultProps, getDerivedStateFromProps} = leafType as unknown as ComponentClass;
          let instance = component.instance as Writable<ComponentInstance>;
          const instanceProps = {...defaultProps, ...leaf.props as object};
          const instanceIsNew = instance == null;
          if (instanceIsNew) {
            instance = new leafType(instanceProps, null) as ComponentInstance;
            component.instance = instance as ComponentInstance;
          }
          instance.context = contextType != null ? useContext(contextType) : undefined;
          // instance props
          for (const key of Object.keys(leafType.prototype)) {
            if (LEGACY_COMPONENT_SUPPORTED[key] === false) {
              console.error("Component has:", Object.keys(leafType.prototype).filter(v => v in LEGACY_COMPONENT_SUPPORTED))
              throw `Not implemented: Component.${key}`;
            }
          }
          // get prevState
          const prevProps = instance.props;
          const prevState = instance.state;
          // get next state
          const stateRef = useRef<Record<string, any>>(prevState ?? {});
          instance.props = instanceProps;
          instance.state = stateRef.current;
          // getDerivedStateFromProps()
          if (getDerivedStateFromProps != null) {
            const diff = getDerivedStateFromProps(instance.props, stateRef.current);
            instance.state = stateRef.current = {...stateRef.current, ...diff};
          }
          // getSnapshotBeforeUpdate()
          const snapshot = undefined;
          // componentDidMount(), componentDidUpdate()
          useLegacyComponentUpdate(() => {
            if (instanceIsNew) instance.componentDidMount?.();
            else instance.componentDidUpdate?.(prevProps, prevState, snapshot);
          });
          // render
          instance.forceUpdate = () => {rerender(component)};
          instance.setState = (newState, callback) => {
            const state = stateRef.current;
            let diff = newState;
            if (typeof diff === "function") diff = diff(state, instance.props);
            const nextState: Record<string, any> = {...state, ...diff};
            if (Object.keys(nextState).some(k => !Object.is(nextState[k], state[k]))) {
              stateRef.current = nextState;
              rerender(component);
            }
            useLegacySetStateCallback(callback);
          };
          leaf = instance.render() as JsReactNode;
          // componentWillUnmount()
          useLegacyWillUnmount(instance.componentWillUnmount);
        } else {
          // FunctionComponent
          leaf = (leafType as FunctionComponent)(leaf.props as JsxProps);
        }
      } break;
      case EXOTIC_FORWARD_REF: {
        const {ref = null, ...rest} = leaf.props as DOMProps;
        leaf = (leafType as unknown as ForwardRefComponent)(rest, ref) as JsReactNode;
      } break;
      default: {
        console.error("Invalid element type:", leaf);
        throw new Error("Invalid element type.");
      }}
      if (leaf instanceof Promise) {throw new Error("Promise<ReactNode> is not supported yet.")}
      // assert number of hooks is constant
      const {prevHookIndex, hookIndex} = component;
      if (prevHookIndex !== 0 && hookIndex !== prevHookIndex) {
        throw new RangeError(`Components must have a constant number of hooks, got: ${hookIndex}, expected: ${prevHookIndex}`);
      }
    }
  }
  component.node = child;
  if (desiredElementType) {
    const currentElement = component.element;
    // assert don't need key prop
    if (currentElement != null && (currentElement?.tagName?.toLowerCase() ?? "Text") !== desiredElementType) {
      let node: Partial<JsReactNode> = child;
      let source = "";
      if (isValidElement(node)) {
        node = {...node};
        source = node.source != null ? `${node.source?.fileName}:${node.source?.lineNumber}` : "";
        delete node.key;
        delete node.source;
      }
      const error = (source ? `${source}: ` : "") + "Dynamic elements must have the key prop";
      console.error(`${error}:`, {before: component.element, next: node});
      if (source) throw new Error(error); /* NOTE: only runs in dev build */
    }
    // create/use the element
    const isElementNew = currentElement == null;
    if (desiredElementType === "Text") {
      let element: Text;
      if (isElementNew) {
        element = new Text();
        component.element = element as unknown as Element;
      } else {
        element = component.element as unknown as Text;
      }
      const newText = String(leaf);
      if (newText !== element.textContent) element.textContent = newText;
      childOrder.push(component);
    } else {
      const isSvgElement = parentIsSvgElement || desiredElementType === "svg";
      createElementAndApplyDOMProps(component, desiredElementType, (leaf as JsReactElement).props, isSvgElement);
      parentIsSvgElement = isSvgElement && (desiredElementType !== "foreignObject");
      const ref = (child as JsReactElement).props.ref;
      /* NOTE: in order to support `ref={setState}`, we must only set the ref when the element is new! */
      if (isElementNew) setRef(ref, component.element);
      childOrder.push(component);
      childOrder = [];
    }
  }
  // render children
  const children: JsReactNode = leaf === child ? (leaf as JsReactElement|null)?.props?.children : leaf;
  jsreact$renderChildren(component, children, childOrder, parentIsSvgElement, isUnderMemo);
  if (context != null) context._currentValue = prevContextValue;
  if (cachedChildOrderStart != null) {
    const cachedChildOrder: CachedChildOrder = childOrder.slice(cachedChildOrderStart);
    component.instance = cachedChildOrder;
  }
}
function jsreact$renderChildren(parent: VirtNode, children: JsReactNode, childOrder: VirtNode[], parentIsSvgElement: boolean, isUnderMemo: boolean) {
  if (children != null) jsreact$renderJsxChildren(parent, children, childOrder, parentIsSvgElement, isUnderMemo);
  unmountUnusedDescendants(parent, parent.flags & FLAGS_GC, true);
  // reorder used children
  const parentElement = parent.element;
  if (parentElement != null && !(parentElement instanceof Text)) {
    let prevElement = null as Element|null;
    for (const c of childOrder) {
      const childElement = c.element!;
      if (prevElement != null) {
        if (prevElement.nextSibling !== childElement) prevElement.after(childElement);
      } else {
        if (childElement.parentElement !== parentElement) parentElement.prepend(childElement)
      }
      prevElement = childElement;
    }
  }
}
function setMemoComponentDescendantsGcFlag(parent: VirtNode) {
  for (const child of Object.values(parent.children)) {
    child.flags = parent.flags & FLAGS_GC;
    setMemoComponentDescendantsGcFlag(child);
  }
}
function unmountUnusedDescendants(parent: VirtNode, parentGcFlag: number, removeChildrenFromDOM: boolean) {
  for (const component of Object.values(parent.children)) {
    if ((component.flags & FLAGS_GC) !== parentGcFlag) {
      delete parent.children[component.key]; /* delete old state */
      // run cleanup code
      for (const hook of component.hooks as Hook[]) {
        const hookType = hook.$$typeof;
        switch (hookType) {
        case undefined: {} break;
        case USE_EFFECT_SYMBOL:
        case USE_INSERTION_EFFECT_SYMBOL:
        case USE_LAYOUT_EFFECT_SYMBOL: {
          (hook as UseEffect).cleanup?.();
        } break
        case USE_LEGACY_WILL_UNMOUNT_SYMBOL: {
          (hook as UseLegacyWillUnmount).callback?.call(component.instance as ComponentInstance);
        } break
        default: {
          throw new Error(String(hookType));
        }}
      }
      const element = component.element;
      if (element != null) {
        // set ref = null
        const child = component.node;
        const ref = isValidElement(child) ? (child.props as DOMProps).ref : undefined;
        setRef(ref, null);
        // remove the element
        if (removeChildrenFromDOM) {
          const $$typeof = (component.node as JsReactElement|null)?.$$typeof;
          if ($$typeof === TYPE_PORTAL) {
            removeChildrenFromDOM = true;
          } else {
            element.remove();
            removeChildrenFromDOM = false;
          }
        }
      }
      unmountUnusedDescendants(component, parentGcFlag, removeChildrenFromDOM);
    }
  }
}
// debug tools
export function whoami(): string {
  // NOTE: firefox is trash, so we have to print one level lower than we would like...
  // @ts-ignore
  if (Error.captureStackTrace) {
    const stacktrace = {} as unknown as {stack: string};
    // @ts-ignore
    (Error.captureStackTrace as Function)(stacktrace, whoami);
    const lines = stacktrace.stack;
    return lines.slice(lines.indexOf("\n") + 1);
  } else {
    const stacktrace = new Error().stack ?? "";
    let lines = stacktrace.split("\n").slice(2);
    if (lines.length > 3) lines = [...lines.slice(0, 3), lines[0].startsWith("  ") ? "  ..." : "..."];
    return lines.join("\n");
  }
}
export function prettifyError(prefix: any, error: string|undefined|null, verbose: boolean): string {
  let lines = (error ?? "").split("\n");
  const acc: string[] = [];
  if (lines[0].includes("Error")) {
    acc.push(lines[0]);
    lines = lines.slice(1);
  } else {
    acc.push(String(prefix));
  }
  let haveEllipsis = false;
  for (let line of lines) {
    if (line === "") continue;
    if (line.includes("jsreact$") && !verbose) {
      if (!haveEllipsis) {
        acc.push("    ...");
        haveEllipsis = true;
      }
    } else {
      haveEllipsis = false;
      acc.push(line.startsWith(" ") ? line : "    " + line);
    };
  }
  return acc.join("\n");
}
// entry
let renderCount = 0;
export function getRenderCount(): number {return renderCount}
function rerender(component: VirtNode) {
  component.flags = component.flags | FLAGS_COMPONENT_STATE_IS_DIRTY;
  let whyDidYouRender: string|null = null;
  if (WHY_DID_YOU_RENDER_PREFIX != null) whyDidYouRender = prettifyError("", whoami(), WHY_DID_YOU_RENDER_VERBOSE);
  const rootComponent = component.root;
  const jsreact$renderNow = async () => {
    try {
      // print debug info
      let infiniteLoop: boolean | string = ++renderCount >= INFINITE_LOOP_COUNT! && INFINITE_LOOP_COUNT != null;
      if (whyDidYouRender != null) {
        const infiniteLoopString = INFINITE_LOOP_COUNT != null ? ` (${renderCount})` : "";
        whyDidYouRender = `${WHY_DID_YOU_RENDER_PREFIX}Render${infiniteLoopString} caused by:${whyDidYouRender}`
        console.debug(`${(performance.now()).toFixed(0)} ms ${whyDidYouRender}`);
      }
      if (infiniteLoop) {
        if (INFINITE_LOOP_PAUSE && renderCount === INFINITE_LOOP_COUNT) debugger; /* NOTE: the browser UI breaks if you debugger too quickly... */
        else throw `Infinite loop (${INFINITE_LOOP_COUNT}):\n${whyDidYouRender ?? whoami()}`;
      };
      // render
      const renderStartMs = performance.now();
      rootComponent.childrenIndex = 0;
      rootComponent.hookIndex = 0;
      rootComponent.flags = ((rootComponent.flags ^ FLAGS_GC) & ~FLAGS_WILL_RERENDER) | FLAGS_IS_RENDERING;
      await jsreact$renderChildren(rootComponent, rootComponent.node, [], false, false);
      // run pending effects
      const {legacyComponentUpdates, legacySetStateCallbacks, useLayoutEffects} = rootComponent.instance as RootHooks;
      (rootComponent.instance as RootHooks) = {
        legacyComponentUpdates: [],
        legacySetStateCallbacks: [],
        useLayoutEffects: [],
      }
      for (const hook of legacyComponentUpdates) hook.callback();
      for (const hook of legacySetStateCallbacks) hook.callback();
      for (const hook of useLayoutEffects) {
          hook.cleanup?.();
          hook.cleanup = hook.setup();
      };
      // delay next render until next monitor frame
      rootComponent.flags = (rootComponent.flags & ~FLAGS_IS_RENDERING) | FLAGS_RERENDERED_THIS_FRAME;
      requestAnimationFrame(() => {
        rootComponent.flags = rootComponent.flags & ~FLAGS_RERENDERED_THIS_FRAME;
        if ((rootComponent.flags & FLAGS_WILL_RERENDER) === 0) renderCount = 0;
      });
      // print debug info
      const renderMs = performance.now() - renderStartMs;
      const tabHasFocus = (rootComponent.flags & FLAGS_TAB_LOST_FOCUS) === 0;
      if (WARN_RENDER_MS > 0 && renderMs > WARN_RENDER_MS && tabHasFocus) console.warn(`Render took ${renderMs.toFixed(0)} ms.`);
    } catch (error: any) {
      if (!IS_PRODUCTION) {
        let message = error;
        if (message instanceof Error) message = prettifyError(error, error.stack ?? "", false);
        replaceDocumentWithError(`Uncaught ${message}`, false, rootComponent.element as HTMLElement);
      }
      throw error;
    }
  };
  const jsreact$rerenderLater = () => {
    if ((rootComponent.flags & FLAGS_IS_RENDERING) === 0) jsreact$renderNow();
    else requestAnimationFrame(jsreact$rerenderLater); /* NOTE: If user code renders too slowly, retry next monitor frame. */
  };
  if ((rootComponent.flags & FLAGS_WILL_RERENDER) !== 0) return; /* NOTE: batch rerenders together when possible */
  rootComponent.flags = rootComponent.flags | FLAGS_WILL_RERENDER;
  if ((rootComponent.flags & (FLAGS_IS_RENDERING | FLAGS_RERENDERED_THIS_FRAME)) === 0) {
    // fast path for initial render and infrequent rerenders
    if (SLOW_EVENT_HANDLERS) queueMicrotask(jsreact$renderNow); /* NOTE: Run before other event handlers, same as React. */
    else setTimeout(jsreact$renderNow, 0) /* NOTE: Run just before the "mouseup" event handler, to minimize rerenders */
  } else {
    // delay to next monitor frame if user code rerenders too quickly
    requestAnimationFrame(jsreact$rerenderLater);
  }
}
export function createRoot(parent: HTMLElement) {
  const render = (node: JsReactNode) => {
    const rootHooks: RootHooks = {
      legacyComponentUpdates: [],
      legacySetStateCallbacks: [],
      useLayoutEffects: [],
    };
    const rootComponent: VirtNode = {
      node,
      element: parent,
      instance: rootHooks,
      prevHookIndex: 0,
      hookIndex: 0,
      hooks: [],
      key: "root",
      children: {},
      childrenIndex: 0,
      memoChildren: [],
      prevEventHandlers: {},
      root: undefined as unknown as VirtNode,
      flags: 0,
    };
    rootComponent.root = rootComponent;
    rerender(rootComponent);
    // set FLAGS_TAB_LOST_FOCUS
    if (document.visibilityState === "hidden") rootComponent.flags = rootComponent.flags | FLAGS_TAB_LOST_FOCUS;
    document.addEventListener("visibilitychange", function() {
      if (document.visibilityState === "hidden") rootComponent.flags = rootComponent.flags | FLAGS_TAB_LOST_FOCUS;
      else rootComponent.flags = rootComponent.flags & ~FLAGS_TAB_LOST_FOCUS;
  });
  }
  return {
    render(node: JsReactNode) {
      window.addEventListener("DOMContentLoaded", () => render(node));
    },
  }
}

// hooks
/** the current component */
let $component = {} as VirtNode;
/** NOTE: internal tool for debugging */
export function __getCurrentComponent(): VirtNode {return $component}
/** NOTE: RootHooks must be run in the order defined here */
type RootHooks = {
  legacyComponentUpdates: UseLegacyComponentUpdate[];
  legacySetStateCallbacks: UseLegacySetStateCallback[];
  useLayoutEffects: UseLayoutEffect[];
}
type UseLegacyComponentUpdate = { callback: () => void };
function useLegacyComponentUpdate(callback: () => void) {
  const component = $component;
  const rootHooks = component.root.instance as RootHooks;
  rootHooks.legacyComponentUpdates.push({ callback });
}
type UseLegacySetStateCallback = { callback: () => void };
function useLegacySetStateCallback(callback: (() => void) | null | undefined) {
  const component = $component;
  if (callback != null) {
    const rootHooks = component.root.instance as RootHooks;
    rootHooks.legacySetStateCallbacks.push({ callback });
  }
}
type Hook = { $$typeof?: symbol };
type NamedHook<T = {}> = T & Required<Hook>;
export function useRerender() {
  const component = $component;
  return useCallback(() => rerender(component), []);
}
export function useHook<T extends object>(defaultState: T = {} as T): T {
  const component = $component;
  const index = component.hookIndex++;
  if (index >= component.hooks.length) {
    if (component.prevHookIndex === 0) (component.hooks as Hook[]).push(Object.seal(defaultState));
    else throw new RangeError(`Components must have a constant number of hooks, got: ${component.hookIndex}, expected: ${component.prevHookIndex}`);
  }
  return component.hooks[index] as T;
}
const USE_LEGACY_WILL_UNMOUNT_SYMBOL = Symbol.for("useLegacyWillUnmount()");
type UseLegacyWillUnmount = NamedHook<{ callback: ((this: ComponentInstance) => void) | undefined | null }>;
export function useLegacyWillUnmount(callback: ((this: ComponentInstance) => void) | undefined | null) {
  const hook = useHook<UseLegacyWillUnmount>({ $$typeof: USE_LEGACY_WILL_UNMOUNT_SYMBOL, callback });
  hook.callback = callback;
}
export function useImperativeHandle<T>(ref: Ref<T> | undefined, createHandle: () => T, dependencies?: any[]) {
  const hook = useHook({ prevDeps: null });
  if (dependenciesDiffer(hook.prevDeps, dependencies)) setRef(ref, createHandle());
}
/** NOTE: for legacy components */
export function createRef<T = undefined>(initialValue?: T): MutableRef<T> {
  return Object.seal({current: initialValue as T});
}
export function useRef<T = undefined>(initialValue?: T): MutableRef<T> {
  const component = $component;
  const prevHookCount = component.hooks.length;
  const hook = useHook({ current: undefined as T });
  if (component.hookIndex > prevHookCount) hook.current = initialValue as T;
  return hook;
}
function isCallback<T, C extends Function>(value: T | C): value is C {return typeof value === "function"}
export function useState<T = undefined>(initialState?: T | (() => T)): [T, (newValue: T) => void] {
  const component = $component;
  const prevHookCount = component.hooks.length;
  type SetStateFunction = (newState: T | ((state: T) => T)) => void;
  const hook = useHook({ state: undefined as T, setState: (() => {}) as SetStateFunction });
  if (component.hookIndex > prevHookCount) {
    if (isCallback(initialState)) hook.state = initialState();
    else hook.state = initialState as T;
    const setState = (newState: T | ((state: T) => T)) => {
      if (isCallback(newState)) newState = newState(hook.state);
      if (!Object.is(hook.state, newState)) {
        hook.state = newState;
        rerender(component);
      }
    };
    hook.setState = setState;
  }
  return [hook.state, hook.setState];
}
function dependenciesDiffer(prevDeps: any[] | null | undefined, deps: any[] | null | undefined): boolean {
  /* NOTE: `Object.is()` for correct NaN handling */
  return prevDeps == null || deps == null || prevDeps.length !== deps.length || prevDeps.some((v, i) => !Object.is(v, deps[i]));
}
type UseEffectSetup = () => (() => void) | null | undefined | void;
type UseEffect = NamedHook<{
  cleanup: (() => void) | null | undefined | void;
  prevDeps: any[] | null;
}>
/** Run `setup()` at some point after this render has finished */
const USE_EFFECT_SYMBOL = Symbol.for("useEffect()");
export function useEffect(setup: UseEffectSetup, dependencies?: any[]): void {
  const hook = useHook<UseEffect>({ $$typeof: USE_EFFECT_SYMBOL, cleanup: null, prevDeps: null });
  if (dependenciesDiffer(hook.prevDeps, dependencies)) {
    hook.prevDeps = [...(dependencies ?? [])];
    setTimeout(() => {
      hook.cleanup?.();
      hook.cleanup = setup();
    }, 0);
  }
}
/** Run `setup()` before refs are set, individually for each component */
const USE_INSERTION_EFFECT_SYMBOL = Symbol.for("useInsertionEffect()");
export function useInsertionEffect(setup: UseEffectSetup, dependencies?: any[]) {
  const hook = useHook<UseEffect>({ $$typeof: USE_INSERTION_EFFECT_SYMBOL, cleanup: null, prevDeps: null });
  if (dependenciesDiffer(hook.prevDeps, dependencies)) {
    hook.prevDeps = [...(dependencies ?? [])];
    hook.cleanup?.();
    hook.cleanup = setup();
  }
}
const USE_LAYOUT_EFFECT_SYMBOL = Symbol.for("useLayoutEffect()");
type UseLayoutEffect = NamedHook<UseEffect & {setup: UseEffectSetup}>
/** Run `setup()` after layout of this render */
export function useLayoutEffect(setup: UseEffectSetup, dependencies?: any[]) {
  const component = $component;
  const hook = useHook<UseLayoutEffect>({ $$typeof: USE_LAYOUT_EFFECT_SYMBOL, setup, cleanup: null, prevDeps: null });
  if (dependenciesDiffer(hook.prevDeps, dependencies)) {
    hook.prevDeps = [...(dependencies ?? [])];
    hook.setup = setup;
    const rootHooks = component.root.instance as RootHooks;
    rootHooks.useLayoutEffects.push(hook);
  }
}
export function useMemo<T, D = any>(callback: () => T, dependencies?: D[]): T {
  const hook = useHook({ current: null as T, prevDeps: null as D[] | null });
  if (dependenciesDiffer(hook.prevDeps, dependencies)) {
    hook.prevDeps = [...(dependencies ?? [])];
    hook.current = callback();
  }
  return hook.current;
}
export function useCallback<T extends Function, D = any>(callback: T, dependencies?: D[]) {
  const hook = useHook({ current: callback, prevDeps: null as D[] | null });
  if (dependenciesDiffer(hook.prevDeps, dependencies)) {
    hook.prevDeps = [...(dependencies ?? [])];
    hook.current = callback;
  }
  return hook.current;
}
export function useId(_idProp_legacy: any): string {
  const component = $component;
  return `_${component.root.hookIndex++}`;
}
export function useDebugValue<T>(_value: T, _formatter?: (value: T) => any) {
  // TODO: maybe store the debug value?
}
export function useReducer<S, A>(reducer: (state: S, action: A) => S, initialArg: S, init?: (initialArg: S) => S): [S, (action: A) => void] {
  const component = $component;
  const prevHookCount = component.hooks.length;
  const hook = useHook({ state: undefined as S });
  if (component.hookIndex > prevHookCount) {
    if (init != null) hook.state = init(initialArg);
    else hook.state = initialArg;
  }
  const dispatch = (action: A) => setTimeout(() => {
    hook.state = reducer(hook.state, action);
    rerender($component);
  }, 0);
  return [hook.state, dispatch];
}
// TODO: more hooks?
