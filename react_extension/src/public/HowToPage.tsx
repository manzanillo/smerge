import {Box, Container, Link, Typography} from "@mui/material";
import {useTranslation} from "react-i18next";
import Footer from "../components/shared/Footer";
import jsImg from "../assets/howto/javascript.png";
import howto1Img from "../assets/howto/1.png";
import howto2Img from "../assets/howto/2.png";
import howto3Img from "../assets/howto/3.png";
import mergeGif from "../assets/howto/merge.gif";
import kanbanGif from "../assets/howto/kanban.gif";
import teacherViewGif from "../assets/howto/teacherview.gif";
import "./Base.css";
import "./HowToPage.css";
import {lightPageContainer} from "./publicPageStyles.ts";

const HowToPage: React.FC = () => {
    const {t} = useTranslation();

    return (
        <Box
            sx={{...lightPageContainer}}
        >
            <Box sx={{...lightPageContainer}}>
                <Box className="jumbotron vertical-center" sx={{width: "100%", py: 2}}>
                    <Container maxWidth="md" className="howto-content">
                        <Typography variant="h3" component="h1" sx={{mb: 2, fontWeight: 700}}>
                            {t("howto.title")}
                        </Typography>

                        <Typography paragraph>
                            {t("howto.intro1")} {t("howto.intro2")} {t("howto.intro3")} {t("howto.intro4")}
                        </Typography>

                        <Typography paragraph>{t("howto.video_intro")}</Typography>

                        <Box className="howto-video-wrap">
                            <iframe
                                width="560"
                                height="315"
                                src="https://www.youtube.com/embed/bqfCOkNY6UM"
                                title="YouTube video player"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </Box>

                        <Typography variant="h4" component="h2" sx={{mt: 3, mb: 2}}>
                            {t("howto.attention")}
                        </Typography>
                        <Typography paragraph>{t("howto.attention_text")}</Typography>
                        <Box className="howto-image-wrap">
                            <img src={jsImg} alt="JavaScript settings"/>
                        </Box>

                        <Typography variant="h4" component="h2" sx={{mt: 3, mb: 2}}>
                            {t("howto.badgers_sett")}
                        </Typography>
                        <Typography paragraph>{t("howto.badgers_sett_1")}</Typography>
                        <Typography paragraph>
                            {t("howto.badgers_sett_2")} {t("howto.badgers_sett_3")}
                        </Typography>
                        <Box className="howto-image-wrap">
                            <img src={howto1Img} alt="Badger sett"/>
                        </Box>

                        <Typography paragraph>
                            {t("howto.badgers_how_1")} {t("howto.badgers_how_2")}
                        </Typography>
                        <Typography paragraph>
                            {t("howto.badgers_save_1")} {t("howto.badgers_save_2")} {t("howto.badgers_save_3")}
                        </Typography>
                        <Box className="howto-image-wrap">
                            <img src={howto2Img} alt="Post to Smerge"/>
                        </Box>

                        <Typography variant="h4" component="h2" sx={{mt: 3, mb: 2}}>
                            {t("howto.collaboration")}
                        </Typography>
                        <Typography paragraph>{t("howto.collaboration_1")}</Typography>
                        <Typography paragraph>{t("howto.collaboration_2")}</Typography>
                        <Box className="howto-image-wrap">
                            <img src={howto3Img} alt="Collaboration"/>
                        </Box>
                        <Typography paragraph>{t("howto.collaboration_3")}</Typography>
                        <Typography paragraph>{t("howto.collaboration_merge")}</Typography>
                        <Box className="howto-image-wrap">
                            <img src={mergeGif} alt="Merge"/>
                        </Box>
                        <Typography paragraph>{t("howto.collaboration_result")}</Typography>

                        <Typography variant="h4" component="h2" sx={{mt: 3, mb: 2}}>
                            {t("howto.revert")}
                        </Typography>
                        <Typography paragraph>{t("howto.revert_text")}</Typography>

                        <Typography variant="h4" component="h2" sx={{mt: 3, mb: 2}}>
                            {t("howto.kanban")}
                        </Typography>
                        <Typography paragraph>{t("howto.kanban_text")}</Typography>
                        <Box className="howto-image-wrap">
                            <img src={kanbanGif} alt="Kanban"/>
                        </Box>
                        <Typography paragraph>{t("howto.kanban_columns")}</Typography>

                        <Box sx={{my: 3, borderBottom: "1px solid #ddd"}}/>

                        <Typography variant="h4" component="h2" sx={{mt: 3, mb: 2}}>
                            {t("howto.for_teachers")}
                        </Typography>
                        <Typography paragraph>{t("howto.for_teachers_text")}</Typography>
                        <Box component="ul" className="howto-list">
                            <Box component="li">{t("howto.teacher_benefit_1")}</Box>
                            <Box component="li">{t("howto.teacher_benefit_2")}</Box>
                            <Box component="li">{t("howto.teacher_benefit_3")}</Box>
                            <Box component="li">{t("howto.teacher_benefit_4")}</Box>
                            <Box component="li">{t("howto.teacher_benefit_5")}</Box>
                        </Box>

                        <Typography variant="h4" component="h2" sx={{mt: 3, mb: 2}}>
                            {t("howto.login")}
                        </Typography>
                        <Typography paragraph>{t("howto.login_text")}</Typography>

                        <Typography variant="h4" component="h2" sx={{mt: 3, mb: 2}}>
                            {t("howto.teacher_view")}
                        </Typography>
                        <Typography paragraph>{t("howto.teacher_view_intro")}</Typography>
                        <Box className="howto-image-wrap">
                            <img src={teacherViewGif} alt="Teacher view"/>
                        </Box>
                        <Typography paragraph>{t("howto.teacher_view_1")}</Typography>
                        <Typography paragraph>{t("howto.teacher_view_2")}</Typography>
                        <Typography paragraph>{t("howto.teacher_view_3")}</Typography>
                        <Typography paragraph>
                            {t("howto.teacher_view_more")}{" "}
                            <Link href="mailto:tilman.michaeli@tum.de" underline="hover" color="#076AAB">
                                {t("footer.contact")}
                            </Link>
                        </Typography>
                    </Container>
                </Box>
            </Box>

            <Footer/>
        </Box>
    );
};

export default HowToPage;
