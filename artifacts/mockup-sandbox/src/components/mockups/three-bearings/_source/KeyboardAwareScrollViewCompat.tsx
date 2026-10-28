import React, { type PropsWithChildren } from 'react';
import { ScrollView, type ScrollViewProps } from 'react-native';

type Props = PropsWithChildren<ScrollViewProps> & { bottomOffset?: number };

export function KeyboardAwareScrollViewCompat({
  bottomOffset: _bottomOffset,
  ...props
}: Props) {
  return <ScrollView {...props} />;
}
