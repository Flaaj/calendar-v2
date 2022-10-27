/**
 * Dumbify the process of attaching useAutoAnimate by making it 1 line instead of 2 lines .
 * Also this takes care of detecting the correct HTML element type. Thanks to this, the hook can be inlined with no worries about anything while looking handy (except maybe that it's a react no-no to define hooks inline, but things like this are IMO an exception)
 *
 * Auto Animate takes care of automatically adding fade out and fade in animations to children elements and dimension transitions to parent
 */

import { useAutoAnimate as _useAutoAnimate } from "@formkit/auto-animate/react";

export const useAutoAnimate = <T extends HTMLElement>() =>
    _useAutoAnimate<T>()[0];
