import Autoplay from 'embla-carousel-autoplay';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

import { Image } from 'src/components/image';
import {
  Carousel,
  useCarousel,
  CarouselDotButtons,
  CarouselArrowBasicButtons,
} from 'src/components/carousel';

// ----------------------------------------------------------------------

export function AppFeatured({ sx, ...other }) {
  // Static fuel price data (replace with API fetch for real-time updates)
  const fuelData = [
    {
      id: 1,
      type: 'Petrol',
      price: 'ZMW 33.61/liter',
      updated: 'May 2, 2025',
      description: 'Current petrol price in Zambia, reflecting recent market trends.',
      imageUrl: '/assets/images/fuel/petrol.jpg', // Replace with actual image path
    },
    {
      id: 2,
      type: 'Diesel',
      price: 'ZMW 28.99/liter',
      updated: 'May 2, 2025',
      description: 'Diesel price, adjusted due to global oil price changes.',
      imageUrl: '/assets/images/fuel/diesel.jpg', // Replace with actual image path
    },
    {
      id: 3,
      type: 'Kerosene',
      price: 'ZMW 28.56/liter',
      updated: 'May 2, 2025',
      description: 'Kerosene price, stable with sufficient national stocks.',
      imageUrl: '/assets/images/fuel/kerosene.jpg', // Replace with actual image path
    },
  ];

  const carousel = useCarousel({ loop: true }, [Autoplay({ playOnInit: true, delay: 8000 })]);

  return (
    <Card sx={[{ bgcolor: 'common.black' }, ...(Array.isArray(sx) ? sx : [sx])]} {...other}>
      <CarouselDotButtons
        scrollSnaps={carousel.dots.scrollSnaps}
        selectedIndex={carousel.dots.selectedIndex}
        onClickDot={carousel.dots.onClickDot}
        sx={{
          top: 16,
          left: 16,
          position: 'absolute',
          color: 'primary.light',
        }}
      />

      <CarouselArrowBasicButtons
        {...carousel.arrows}
        options={carousel.options}
        sx={{
          top: 8,
          right: 8,
          position: 'absolute',
          color: 'common.white',
        }}
      />

      <Carousel carousel={carousel}>
        {fuelData.map((item) => (
          <CarouselItem key={item.id} item={item} />
        ))}
      </Carousel>
    </Card>
  );
}

// ----------------------------------------------------------------------

function CarouselItem({ item, sx, ...other }) {
  return (
    <Box
      sx={[
        {
          width: 1,
          position: 'relative',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Box
        sx={{
          p: 3,
          gap: 1,
          width: 1,
          bottom: 0,
          zIndex: 9,
          display: 'flex',
          position: 'absolute',
          color: 'common.white',
          flexDirection: 'column',
        }}
      >
        <Typography variant="overline" sx={{ color: 'primary.light' }}>
          Fuel Price Update
        </Typography>

        <Link color="inherit" underline="none" variant="h5" noWrap>
          {item.type}: {item.price}
        </Link>

        <Typography variant="body2" noWrap>
          {item.description}
        </Typography>

        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          Updated: {item.updated}
        </Typography>
      </Box>

      <Image
        alt={item.type}
        src={item.imageUrl}
        slotProps={{
          overlay: {
            sx: (theme) => ({
              backgroundImage: `linear-gradient(to bottom, transparent 0%, ${theme.vars.palette.common.black} 75%)`,
            }),
          },
        }}
        sx={{ width: 1, height: { xs: 288, xl: 320 } }}
      />
    </Box>
  );
}
