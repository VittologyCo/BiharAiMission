/**
 * DOM Reconciliation Patch for React Applications
 * 
 * Prevents fatal crashes caused by Google Translate, Chrome Auto-Translate,
 * Grammarly, and third-party browser extensions mutating DOM nodes under React.
 * 
 * When Google Translate wraps or alters text nodes inside <font> tags, React's
 * reconciliation calls parent.insertBefore(newNode, referenceNode) or
 * parent.removeChild(childNode). If the reference node has been reparented,
 * the native DOM method throws "NotFoundError: Failed to execute 'insertBefore'
 * on 'Node': The node before which the new node is to be inserted is not a child
 * of this node."
 * 
 * This patch intercepts those calls and safely redirects the insertion or removal,
 * preventing unhandled exceptions and eliminating the 500 error boundary crash.
 */

if (typeof window !== 'undefined' && typeof Node === 'function' && Node.prototype) {
  // 1. Patch Node.prototype.insertBefore
  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (console && typeof console.warn === 'function') {
        console.warn(
          'React DOM patch: referenceNode is not a child of this node (likely reparented by Google Translate or browser extension). Safely redirecting insertion.',
          referenceNode,
          this
        );
      }
      if (referenceNode.parentNode) {
        return referenceNode.parentNode.insertBefore(newNode, referenceNode);
      }
      return this.appendChild(newNode);
    }
    return originalInsertBefore.call(this, newNode, referenceNode);
  };

  // 2. Patch Node.prototype.removeChild
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child) {
    if (child && child.parentNode !== this) {
      if (console && typeof console.warn === 'function') {
        console.warn(
          'React DOM patch: child node is not a child of this node. Safely removing.',
          child,
          this
        );
      }
      if (child.parentNode) {
        return child.parentNode.removeChild(child);
      }
      if (typeof child.remove === 'function') {
        child.remove();
        return child;
      }
      return child;
    }
    return originalRemoveChild.call(this, child);
  };
}
