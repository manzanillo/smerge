import React, { useEffect, useState, useRef } from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useTranslation } from 'react-i18next';
import { TutorialStep } from './tutorial.ts';

interface TutorialOverlayProps {
  step: TutorialStep;
  progress: { current: number; total: number };
  isLastStep: boolean;
  onNext: () => void;
  onClose: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  step,
  progress,
  isLastStep,
  onNext,
  onClose,
}) => {
  const { t } = useTranslation();
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  // useEffect für Target-Position
  useEffect(() => {
    const findTarget = () => {
      if (!step.target) {
        return;
      }
      let target: HTMLElement | null = document.querySelector(step.target.selector);

      if (target) {
        const rect = target.getBoundingClientRect();
        const position = step.target.position || 'top';

        const offsetHeight = 20;
        const offsetWidth = 50;

        let top = rect.top;
        let left = rect.left + rect.width / 2;

        switch (position) {
          case 'bottom':
            top = rect.bottom + offsetHeight;
            break;
          case 'top':
            top = rect.top - offsetHeight;
            break;
          case 'left':
            left = rect.left - offsetWidth;
            top = rect.top + rect.height / 2;
            break;
          case 'right':
            left = rect.right + offsetWidth;
            top = rect.top + rect.height / 2;
            break;
          case 'top-left':
            left = rect.left - offsetWidth;
            top = rect.top - offsetHeight;
            break;
        }
        setCoords({ top, left, width: rect.width, height: rect.height });
      }
    };

    findTarget();
    const timeout = setTimeout(findTarget, 100);

    return () => {
      clearTimeout(timeout);
    };
  }, [step]);

  const getTooltipStyle = () => {
    const baseStyle: React.CSSProperties = {
      position: 'fixed',
      zIndex: 10_000,
    };

    if (step?.mode === 'modal') {
      // Centered modal
      return {
        ...baseStyle,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    // Relative position der Tutorial-Box zum Target
    const position = step.target?.position || 'top';
    const style = { ...baseStyle, top: coords.top, left: coords.left };
    switch (position) {
      case 'bottom':
        return {
          ...style,
          transform: 'translateX(-50%)',
        };
      case 'top':
        return {
          ...style,
          transform: 'translate(-50%, -100%)',
        };
      case 'left':
        return {
          ...style,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          ...style,
          transform: 'translateY(-50%)',
        };
      default:
        return {
          ...style,
          transform: 'translate(-50%, -100%)',
        };
    }
  };

  // Small View: Kleine Anzeige mit Knopf zum Weitermachen, um Platz zur Arbeit zu geben.
  // Wird z.B. genutzt, wenn der Nutzer am Snap!-Projekt arbeiten soll.
  if (step?.mode === 'small') {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 12,
          left: 0,
          right: 0,
          zIndex: 10000,
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <Button
          variant="contained"
          onClick={onNext}
          endIcon={<ArrowForwardIcon />}
          sx={{
            pointerEvents: 'auto',
            backgroundColor: '#076AAB',
            color: 'white',
            '&:hover': { backgroundColor: '#055a8c' },
          }}
        >
          {t('tutorial.done_continue')}
        </Button>
      </Box>
    );
  }

  return (
    <>
      {/* Tooltip/Modal */}
      <Paper
        ref={tooltipRef}
        elevation={8}
        sx={{
          ...getTooltipStyle(),
          maxWidth: 400,
          p: 3,
          backgroundColor: 'white',
          border: '2px solid #076AAB',
        }}
      >
        {/* Progress indicator */}
        <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: 'block', color: "black" }}>
          {t('tutorial.step')} {progress.current} / {progress.total}
        </Typography>

        <Typography variant="h6" sx={{ mb: 1, pr: 4, color: "black" }}>
          {t(step.title)}
        </Typography>

        <Typography variant="body2" sx={{ mb: 3, color: "black" }}>
          {t(step.description)}
        </Typography>

        {/* Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
              variant="contained"
              size="small"
              endIcon={<CloseIcon />}
              onClick={onClose}
              sx={{
                backgroundColor: '#076AAB',
                color: 'white',
                '&:hover': { backgroundColor: '#055a8c' },
              }}
          >
            { t('tutorial.skip')}
          </Button>
          <Button
            variant="contained"
            size="small"
            disabled={!step.allowNext}
            endIcon={<ArrowForwardIcon />}
            onClick={onNext}
            sx={{
              backgroundColor: '#076AAB',
              color: 'white',
              '&:hover': { backgroundColor: '#055a8c' },
            }}
          >
            {isLastStep ? t('tutorial.finish') : t('tutorial.next')}
          </Button>
        </Box>
      </Paper>
    </>
  );
};

export default TutorialOverlay;
