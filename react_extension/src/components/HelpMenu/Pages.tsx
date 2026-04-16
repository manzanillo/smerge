import { useTranslation } from "react-i18next";
import HelpDisplayItem from "./HelpDisplayItem";
import HelpDisplayItemContent from "./HelpDisplayItemContent";
import helpMove0Gif from "../../assets/help/help_move_0.gif";
import helpMove1Gif from "../../assets/help/help_move_1.gif";
import helpMove2Gif from "../../assets/help/help_move_2.gif";
import uploadGif from "../../assets/help/upload.gif";
import openSnapGif from "../../assets/help/open_snap.gif";
import importGif from "../../assets/help/import.gif";
import syncGif from "../../assets/help/sync.gif";
import mergeGif from "../../assets/help/merge.gif";
import conflictGif from "../../assets/help/conflict.gif";
import oldMergeGif from "../../assets/help/old_merge.gif";
import settingsPng from "../../assets/help/settings.png";
import graphSettingsPng from "../../assets/help/graph_settings.png";

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
        src={helpMove0Gif}
      />
      <HelpDisplayItemContent
        parentHeight={basePageHeight}
        header={t("HelpPages.page0.item1.header")}
        footer={t("HelpPages.page0.item1.footer")}
        src={helpMove1Gif}
      />
      <HelpDisplayItemContent
        parentHeight={basePageHeight}
        header={t("HelpPages.page0.item2.header")}
        footer={t("HelpPages.page0.item2.footer")}
        src={helpMove2Gif}
      />
      <HelpDisplayItemContent
        parentHeight={basePageHeight}
        header={t("HelpPages.page0.item3.header")}
        footer={t("HelpPages.page0.item3.footer")}
        src={uploadGif}
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
        src={openSnapGif}
      />
      <HelpDisplayItemContent
        parentHeight={basePageHeight}
        header={t("HelpPages.page1.item1.header")}
        footer={t("HelpPages.page1.item1.footer")}
        src={importGif}
      />
      <HelpDisplayItemContent
        parentHeight={basePageHeight}
        header={t("HelpPages.page1.item2.header")}
        footer={t("HelpPages.page1.item2.footer")}
        src={syncGif}
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
        src={mergeGif}
      />
      <HelpDisplayItemContent
        parentHeight={basePageHeight}
        header={t("HelpPages.page2.item1.header")}
        footer={t("HelpPages.page2.item1.footer")}
        src={conflictGif}
      />
      <HelpDisplayItemContent
        parentHeight={basePageHeight}
        header={t("HelpPages.page2.item2.header")}
        footer={t("HelpPages.page2.item2.footer")}
        src={oldMergeGif}
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
        src={settingsPng}
      />
      <HelpDisplayItemContent
        parentHeight={basePageHeight}
        header={t("HelpPages.page3.item1.header")}
        footer={t("HelpPages.page3.item1.footer")}
        src={graphSettingsPng}
      />
      <HelpDisplayItemContent
        parentHeight={basePageHeight}
        header={t("HelpPages.page3.item2.header")}
        footer={t("HelpPages.page3.item2.footer")}
        src={graphSettingsPng}
      />
    </HelpDisplayItem>
  );
};
