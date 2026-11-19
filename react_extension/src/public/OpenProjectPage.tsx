import {useState} from "react";
import {Alert, Box, Button, Container, Link, TextField, Typography} from "@mui/material";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import Footer from "../components/shared/Footer";
import {openProjectPublic} from "../services/PublicProjectService";
import {lightPageContainer, lightPageContent, lightTextFieldSx, primaryButtonSx} from "./publicPageStyles";
import "./Base.css";

const OpenProjectPage: React.FC = () => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const [pin, setPin] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);


    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        setIsSubmitting(true);
        try {
            const result = await openProjectPublic({
                pin: pin.trim(),
                password,
            });
            navigate(`/project_view/${result.project_id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : t("open_project.error_generic"));
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <Box sx={lightPageContainer}>
            <Box sx={lightPageContent}>
                <Container maxWidth="sm">
                    <Box component="form" onSubmit={handleSubmit}>
                        <Typography variant="h5" sx={{mb: 2}}>
                            {t("open_project.title")}
                        </Typography>
                        {error ? (
                            <Alert severity="error" sx={{mb: 2}}>
                                {error}
                            </Alert>
                        ) : null}
                        <TextField
                            fullWidth
                            required
                            label={t("open_project.pin")}
                            value={pin}
                            onChange={(event) => setPin(event.target.value)}
                            sx={{...lightTextFieldSx, mb: 2}}
                        />
                        <TextField
                            fullWidth
                            type="password"
                            label={t("open_project.password_optional")}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            sx={{...lightTextFieldSx, mb: 2}}
                        />
                        <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                            <Link href="/restore_info" underline="hover" color="inherit">
                                {t("open_project.forgot")}
                            </Link>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={isSubmitting}
                                sx={primaryButtonSx}
                            >
                                {t("open_project.submit")}
                            </Button>
                        </Box>
                    </Box>
                </Container>
            </Box>
            <Footer/>
        </Box>
    );
};
export default OpenProjectPage;
