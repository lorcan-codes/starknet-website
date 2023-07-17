import type { Page as PageType, TopLevelBlock } from "@starknet-io/cms-data/src/pages";
import { PageLayout } from "@ui/Layout/PageLayout";
import moment from "moment";
import remarkParse from "remark-parse";
import { Block } from "src/blocks/Block";
import { unified } from "unified";
import { Index } from "unist-util-index";
import { TableOfContents } from "../(components)/TableOfContents";
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
} from "@chakra-ui/react";
import '@ui/CodeHighlight/code-highlight-init'

type CMSPageProps = {
  data: PageType;
  locale: string;
};
export default function CMSPage({
  data,
  locale,
}: CMSPageProps) {
  const date = data?.gitlog?.date;

  return (
    <Box>
      <PageLayout
        breadcrumbs={
          <>
            {data.breadcrumbs &&
            data.breadcrumbs_data &&
            data.breadcrumbs_data.length > 0 ? (
              <Breadcrumb separator="/">
                <BreadcrumbItem>
                  <BreadcrumbLink
                    fontSize="sm"
                    href={`/${data.breadcrumbs_data[0].locale}`}
                  >
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    fontSize="sm"
                    href={`/${data.breadcrumbs_data[0].locale}/${data.breadcrumbs_data[0].slug}`}
                  >
                    {data.breadcrumbs_data[0].title}
                  </BreadcrumbLink>
                </BreadcrumbItem>

                <BreadcrumbItem isCurrentPage>
                  <BreadcrumbLink fontSize="sm">{data.title}</BreadcrumbLink>
                </BreadcrumbItem>
              </Breadcrumb>
            ) : null}
          </>
        }
        pageLastUpdated={
          data.page_last_updated && date
            ? `Page last updated ${moment(date).fromNow()}  `
            : null
        }
        main={
          <Flex
            direction="column"
            gap={{
              base: data.template === "content" ? "32px" : "56px",
              lg: data.template === "content" ? "32px" : "136px",
            }}
          >
            {data.blocks?.map((block, i) => {
              return (
                <Block
                  key={i}
                  block={block}
                  locale={locale}
                />
              );
            })}
          </Flex>
        }
        rightAside={
          data.template === "content" ? (
            <TableOfContents headings={pageToTableOfContents(data.blocks, 1)} />
          ) : null
        }
      />
    </Box>
  );
}

interface HeadingData {
  readonly title: string;
  readonly level: number;
}

function pageToTableOfContents(blocks: readonly TopLevelBlock[] = [], level: number, tableOfContents: HeadingData[] = []): readonly HeadingData[] {
  blocks.forEach((block) => {
    if(block.type === 'page_header'){
      return
    }
    else if (block.type === "container") {
      pageToTableOfContents(block.blocks, level, tableOfContents);
    } else if (block.type === "flex_layout" || block.type === "group") {
      if (!block.heading) {
        pageToTableOfContents(block.blocks, level, tableOfContents);
      } else {
        const headingData: HeadingData = {
          title: block.heading,
          level,
        };
        tableOfContents.push(headingData);
        pageToTableOfContents(block.blocks, level + 1, tableOfContents);
      }
    } else if (block.type === "ordered_block") {
      const sortedBlocks = Array.from(block.blocks || []).sort((a, b) => {
        return a.title.localeCompare(b.title);
      });

      const blockItems: HeadingData[] = sortedBlocks.map((block) => {
        return {
          title: block.title,
          level
        };
      });

      tableOfContents.push(...blockItems);
    } else if (block.type === "accordion") {
      if (block.heading != null) {
        const headingData: HeadingData = {
          title: block.heading,
          level
        };
        tableOfContents.push(headingData);
      }
    } else if (block.type === "markdown") {
      const processor = unified()
        .use(remarkParse)
        .use(() => {
          return (tree: any) => {
            const typeIndex = new Index("type", tree);
            const headings = typeIndex.get("heading");

            const headingItems: HeadingData[] = headings.map((node: any) => {
              const textNode = node.children.find((n: any) => {
                return n.type === "text";
              });

              return {
                title: textNode?.value ?? "",
                level
              };
            });

            tableOfContents.push(...headingItems);
          };
        });

      const node = processor.parse(block.body);
      processor.runSync(node);
    } else if ("title" in block) {
      const headingData: HeadingData = {
        title: block.title,
        level
      };
      tableOfContents.push(headingData);
    } else if ("heading" in block && block.heading != null) {
      const headingData: HeadingData = {
        title: block.heading,
        level
      };
      tableOfContents.push(headingData);
    }
  });

  return tableOfContents;
}
