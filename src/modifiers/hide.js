// @flow
import type {
  ModifierArguments,
  Modifier,
  Rect,
  Options,
  SideObject,
} from '../types';
import { top, bottom, left, right } from '../enums';
import detectOverflow from '../utils/detectOverflow';

const getOffsets = (
  overflow: SideObject,
  rect: Rect,
  preventedOffsets: { x: number, y: number } = { x: 0, y: 0 }
): SideObject => ({
  top: overflow.top - rect.height - preventedOffsets.y,
  right: overflow.right - rect.width + preventedOffsets.x,
  bottom: overflow.bottom - rect.height + preventedOffsets.y,
  left: overflow.left - rect.width - preventedOffsets.x,
});

const isAnySideFullyClipped = (overflow: SideObject): boolean =>
  [top, right, bottom, left].some(side => overflow[side] >= 0);

function hide({ state, name }: ModifierArguments<Options>) {
  const referenceRect = state.measures.reference;
  const popperRect = state.measures.popper;
  const preventedOffsets = state.modifiersData.preventOverflow;

  const referenceOverflow = detectOverflow(state, {
    elementContext: 'reference',
  });
  const popperAltOverflow = detectOverflow(state, {
    altBoundary: true,
  });

  const referenceClippingOffsets = getOffsets(referenceOverflow, referenceRect);
  const popperEscapeOffsets = getOffsets(
    popperAltOverflow,
    popperRect,
    preventedOffsets
  );

  const isReferenceHidden = isAnySideFullyClipped(referenceClippingOffsets);
  const hasPopperEscaped = isAnySideFullyClipped(popperEscapeOffsets);

  state.modifiersData[name] = {
    referenceClippingOffsets,
    popperEscapeOffsets,
    isReferenceHidden,
    hasPopperEscaped,
  };

  state.attributes.popper = {
    ...state.attributes.popper,
    'data-popper-reference-hidden': isReferenceHidden,
    'data-popper-escaped': hasPopperEscaped,
  };

  return state;
}

export default ({
  name: 'hide',
  enabled: true,
  phase: 'main',
  requires: [],
  optionallyRequires: ['preventOverflow'],
  fn: hide,
}: Modifier<Options>);
