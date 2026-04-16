import React, {useState} from "react";
import {
    Alert,
    Box,
    Button,
    Container,
    TextField,
    Typography,
} from "@mui/material";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import Footer from "../components/shared/Footer";
import {restorePasswordInfo} from "../services/PublicProjectService";
import {
    lightPageContainer,
    lightPageContent,
    lightTextFieldSx,
    primaryButtonSx,
} from "./publicPageStyles";
import "./Base.css";

const RestoreInfoPage: React.FC = () => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);


    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        setSuccess(false);
        setIsSubmitting(true);
        try {
            await restorePasswordInfo({email: email.trim()});
            setSuccess(true);
            setTimeout(() => {
                navigate("/open");
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : t("restore_info.error_generic"));
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
                            {t("restore_info.title")}
                        </Typography>
                        <Typography paragraph sx={{mb: 2}}>
                            {t("restore_info.description")}
                        </Typography>
                        {error ? (
                            <Alert severity="error" sx={{mb: 2}}>
                                {error}
                            </Alert>
                        ) : null}
                        {success ? (
                            <Alert severity="success" sx={{mb: 2}}>
                                {t("restore_info.success")}
                            </Alert>
                        ) : null}
                        <TextField
                            fullWidth
                            required
                            type="email"
                            label={t("restore_info.email")}
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            sx={{...lightTextFieldSx, mb: 2}}
                        />
                        <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                            <Button
                                variant="text"
                                onClick={() => navigate(-1)}
                                sx={{color: "#666"}}
                            >
                                {t("restore_info.back")}
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={isSubmitting}
                                sx={primaryButtonSx}
                            >
                                {t("restore_info.submit")}
                            </Button>
                        </Box>
                    </Box>
                </Container>
            </Box>
            <Footer/>
        </Box>
    );
};

export default RestoreInfoPage;

