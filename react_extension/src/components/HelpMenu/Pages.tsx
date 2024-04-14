import { useTranslation } from "react-i18next";
import HelpDisplayItem from "./HelpDisplayItem";
import HelpDisplayItemContent from "./HelpDisplayItemContent";

// General Usage
// - Move (and zoom)
// - Select nodes
// - Context menu
export const Page0 = () => {
  const { t } = useTranslation();
  const basePageHeight = 70;

  return (
    <HelpDisplayItem
      header={t("HelpPages.page0.header")}
      height={basePageHeight}
    >
      <HelpDisplayItemContent
        parentHeight={basePageHeight}
        header={t("HelpPages.page0.item0.header")}
        footer={t("HelpPages.page0.item0.footer")}
        src="/ext/img/help_move_0.gif"
      />
      <HelpDisplayItemContent
        parentHeight={basePageHeight}
        header={t("HelpPages.page0.item1.header")}
        footer={t("HelpPages.page0.item1.footer")}
        src="/ext/img/help_move_1.gif"
      />
      <HelpDisplayItemContent
        parentHeight={basePageHeight}
        header={t("HelpPages.page0.item2.header")}
        footer={t("HelpPages.page0.item2.footer")}
        src="/ext/img/help_move_2.gif"
      />
      <HelpDisplayItemContent
        parentHeight={basePageHeight}
        header={t("HelpPages.page0.item3.header")}
        footer={t("HelpPages.page0.item3.footer")}
        src="/ext/img/upload.gif"
      />
    </HelpDisplayItem>
  );
};

// Snap!
// - Open Snap!
// - Activate JS
// - Import data
// - Post to Smerge
export const Page1 = () => {
  const { t } = useTranslation();
  const basePageHeight = 70;

  return (
    <HelpDisplayItem
      header={t("HelpPages.page1.header")}
      height={basePageHeight}
    >
      <HelpDisplayItemContent
        parentHeight={basePageHeight}
        header={t("HelpPages.page1.item0.header")}
        footer={t("HelpPages.page1.item0.footer")}
        src="/ext/img/open_snap.gif"
      />
      <HelpDisplayItemContent
        parentHeight={basePageHeight}
        header={t("HelpPages.page1.item1.header")}
        footer={t("HelpPages.page1.item1.footer")}
        src="/ext/img/import.gif"
      />
      <HelpDisplayItemContent
        parentHeight={basePageHeight}
        header={t("HelpPages.page1.item2.header")}
        footer={t("HelpPages.page1.item2.footer")}
        src="/ext/img/sync.gif"
      />
    </HelpDisplayItem>
  );
};

// Merge
// - Merge two elements
// - Merge conflicts
// - Switch to old merger
export const Page2 = () => {
  const { t } = useTranslation();
  const basePageHeight = 70;

  return (
    <HelpDisplayItem
      header={t("HelpPages.page2.header")}
      height={basePageHeight}
    >
      <HelpDisplayItemContent
        parentHeight={basePageHeight}
        header={t("HelpPages.page2.item0.header")}
        footer={t("HelpPages.page2.item0.footer")}
        src="/ext/img/merge.gif"
      />
      <HelpDisplayItemContent
        parentHeight={basePageHeight}
        header={t("HelpPages.page2.item1.header")}
        footer={t("HelpPages.page2.item1.footer")}
        src="/ext/img/conflict.gif"
      />
      <HelpDisplayItemContent
        parentHeight={basePageHeight}
        header={t("HelpPages.page2.item2.header")}
        footer={t("HelpPages.page2.item2.footer")}
        src="/ext/img/old_merge.gif"
      />
    </HelpDisplayItem>
  );
};

// Settings
// Project settings
// Graph settings
// Saving and loading the layout
export const Page3 = () => {
  const { t } = useTranslation();
  const basePageHeight = 70;

  return (
    <HelpDisplayItem
      header={t("HelpPages.page3.header")}
      height={basePageHeight}
    >
      <HelpDisplayItemContent
        parentHeight={basePageHeight}
        header={t("HelpPages.page3.item0.header")}
        footer={t("HelpPages.page3.item0.footer")}
        src="/ext/img/settings.png"
      />
      <HelpDisplayItemContent
        parentHeight={basePageHeight}
        header={t("HelpPages.page3.item1.header")}
        footer={t("HelpPages.page3.item1.footer")}
        src="/ext/img/graph_settings.png"
      />
      <HelpDisplayItemContent
        parentHeight={basePageHeight}
        header={t("HelpPages.page3.item2.header")}
        footer={t("HelpPages.page3.item2.footer")}
        src="/ext/img/graph_settings.png"
      />
    </HelpDisplayItem>
  );
};
