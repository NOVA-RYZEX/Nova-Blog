import type { Blog } from "./schemas";

type TocLinkChild = {
  id: string;
  depth: number;
  text: string;
};

type TocLink = {
  id: string;
  depth: number;
  text: string;
  children: TocLinkChild[];
};

// TODO: Dive deeper into the structure of the body value and create more specific types
// for different content blocks (e.g., paragraphs, code blocks, images, etc.)
type _BodyValueObject = {
  className: string;
  code: string;
  language: string;
  meta: string;
  style: string;
};

type BodyValue = string | [string, Record<string, any>, BodyValue[]];

type BodyToc = {
  title: string;
  searchDepth: number;
  depth: number;
  links: TocLink[];
};

type Body = {
  type: "minimark";
  value: BodyValue[];
  toc: BodyToc;
};

type readingTime = {
  text: string;
  minutes: number;
  time: number;
  words: number;
};

type meta = {
  readingTime: readingTime;
  [key: string]: any;
};

export type BlogType = Blog & {
  id: string;
  body: Body;
  extension: string;
  meta: meta;
  navigation: boolean;
  path: string;
  stem: string;
  __hash__: string;
};
