import { useTranslation } from "react-i18next";
import HelpDisplayItem from "./HelpDisplayItem";
import HelpDisplayItemContent from "./HelpDisplayItemContent";

// General Usage
// - Move (and Zoom)
// - Select
// - Context Menu
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
    </HelpDisplayItem>
  );
};

// Snap
// - Change to snap
// - Activate js
// - reupload
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
        src="/ext/img/help_move_0.gif"
      />
      <HelpDisplayItemContent
        parentHeight={basePageHeight}
        header={t("HelpPages.page1.item1.header")}
        footer={t("HelpPages.page1.item1.footer")}
        src="/ext/img/help_move_1.gif"
      />
    </HelpDisplayItem>
  );
};

// Merge
// - Merge modes
// - on conflict
// - conflict steps
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
        src="/ext/img/help_move_0.gif"
      />
      <HelpDisplayItemContent
        parentHeight={basePageHeight}
        header={t("HelpPages.page2.item1.header")}
        footer={t("HelpPages.page2.item1.footer")}
        src="/ext/img/help_move_1.gif"
      />
    </HelpDisplayItem>
  );
};
