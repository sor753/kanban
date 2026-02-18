import { useEffect, useRef, type RefObject } from 'react';

// 参考
// How can I use multiple refs for an array of elements with hooks?
// https://stackoverflow.com/questions/54633690/how-can-i-use-multiple-refs-for-an-array-of-elements-with-hooks
// How to fix 'Type is not assignable error' in Tyescript for an array of elements?
// https://stackoverflow.com/questions/78361516/how-to-fix-type-is-not-assignable-error-in-tyescript-for-an-array-of-elements
export const useDraggableRefList = <T extends HTMLElement>() => {
  const dndRefList = useRef<
    ({
      areaId: string;
      index: number;
      el: T | null;
    } | null)[]
  >([]);
  useEffect(() => {
    // selectRefListを初期化
    if (!dndRefList.current) {
      dndRefList.current = [];
    }
  }, []);

  return dndRefList;
};

export const setDraggableRef = <T extends HTMLElement>(
  el: T | null,
  refList: RefObject<
    ({
      areaId: string;
      index: number;
      el: T | null;
    } | null)[]
  >,
  areaId: string,
  index: number,
) => {
  // すでに同じareaIdとindexの要素が存在するか確認
  const existingIndex = refList.current.findIndex(
    (ref) => ref?.areaId === areaId && ref?.index === index,
  );

  if (existingIndex !== -1) {
    // 存在する場合は更新
    refList.current[existingIndex] = { areaId, index, el };
  } else {
    // 存在しない場合は追加
    refList.current.push({ areaId, index, el });
  }
};

export const useDroppableRefList = <T extends HTMLElement>() => {
  const dndRefList = useRef<
    ({
      areaId: string;
      el: T | null;
    } | null)[]
  >([]);
  useEffect(() => {
    // selectRefListを初期化
    if (!dndRefList.current) {
      dndRefList.current = [];
    }
  }, []);

  return dndRefList;
};

export const setDroppableRef = <T extends HTMLElement>(
  el: T | null,
  refList: RefObject<
    ({
      areaId: string;
      el: T | null;
    } | null)[]
  >,
  areaId: string,
) => {
  // すでに同じareaIdの要素が存在するか確認
  const existingIndex = refList.current.findIndex(
    (ref) => ref?.areaId === areaId,
  );

  if (existingIndex !== -1) {
    // 存在する場合は更新
    refList.current[existingIndex] = { areaId, el };
  } else {
    // 存在しない場合は追加
    refList.current.push({ areaId, el });
  }
};
