import { Box, Link } from "@mui/material";
import { useTranslation } from "react-i18next";
import EmailIcon from "@mui/icons-material/Email";
import ExploreIcon from "@mui/icons-material/Explore";

const Footer: React.FC = () => {
    const { t } = useTranslation();

    return (
        <Box
            component="footer"
            sx={{
                width: "100%",
                marginTop: "auto",
                position: "relative",
            }}
        >
            {/* Wave SVG */}
            <Box
                className="wave-container"
                sx={{
                    position: "relative",
                    textAlign: "center",
                    overflow: "hidden",
                    width: "100%",
                    "& svg": {
                        display: "block",
                        width: "100%",
                        height: "auto",
                    },
                }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style={{ stopColor: "rgb(195, 158, 193)", stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: "rgb(7, 106, 171)", stopOpacity: 1 }} />
                        </linearGradient>
                    </defs>
                    <path
                        fill="url(#gradient)"
                        fillOpacity="1"
                        d="M0,160L40,181.3C80,203,160,245,240,234.7C320,224,400,160,480,128C560,96,640,96,720,112C800,128,880,160,960,165.3C1040,171,1120,149,1200,154.7C1280,160,1360,192,1400,208L1440,224L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z"
                    ></path>
                </svg>
            </Box>

            {/* Footer Text */}
            <Box
                className="footer-text"
                sx={{
                    textAlign: "center",
                    padding: "0.3em",
                    height: "3em",
                    background: "linear-gradient(90deg, rgb(195, 158, 193) 0%, rgba(7, 106, 171) 100%)",
                    marginTop: "-10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                }}
            >
                <Link
                    href="https://github.com/manzanillo/smerge"
                    target="_blank"
                    rel="noopener noreferrer"
                    title={t("footer.github")}
                    sx={{
                        color: "white",
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        "&:hover": {
                            textDecoration: "underline",
                        },
                    }}
                >
                    <ExploreIcon fontSize="small" />
                    {t("footer.github")}
                </Link>

                <Link
                    href="mailto:tilman.michaeli@tum.de"
                    title={t("footer.contact")}
                    sx={{
                        color: "white",
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        "&:hover": {
                            textDecoration: "underline",
                        },
                    }}
                >
                    <EmailIcon fontSize="small" />
                    {t("footer.contact")}
                </Link>
            </Box>
        </Box>
    );
};

export default Footer;



