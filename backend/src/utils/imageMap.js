/**
 * Image Mapping Configuration
 * Maps application semantic sections and products to the user's authentic uploaded photos.
 * Edit this file anytime to point to new media or replace assets.
 */

const IMAGE_MAP = {
  // Brand & Heritage Sections
  heroShowcase: '/images/heritage-seeds-burlap.png',
  heroSecondary: '/images/plain-makhana-bowl.png',
  ourStory: '/images/heritage-seeds-burlap.png',
  waterlandsBihar: '/images/heritage-seeds-burlap.png',
  traditionalSourcing: '/images/makhana-seeds-spoon.png',
  whyMakhana: '/images/plain-makhana-bowl.png',
  recipesHero: '/images/cheese-flavoured-dip.png',
  snackDip: '/images/cheese-flavoured-dip.png',
  roastedJar: '/images/roasted-makhana-jar.png',

  // Product Images Mapping
  products: {
    'premium-plain-makhana': {
      primary: '/images/plain-makhana-bowl.png',
      gallery: [
        '/images/plain-makhana-bowl.png',
        '/images/heritage-seeds-burlap.png',
        '/images/makhana-seeds-spoon.png'
      ]
    },
    'roasted-makhana': {
      primary: '/images/roasted-makhana-jar.png',
      gallery: [
        '/images/roasted-makhana-jar.png',
        '/images/plain-makhana-bowl.png',
        '/images/cheese-flavoured-dip.png'
      ]
    },
    'masala-makhana': {
      primary: '/images/roasted-makhana-jar.png',
      gallery: [
        '/images/roasted-makhana-jar.png',
        '/images/cheese-flavoured-dip.png',
        '/images/plain-makhana-bowl.png'
      ]
    },
    'peri-peri-makhana': {
      primary: '/images/cheese-flavoured-dip.png',
      gallery: [
        '/images/cheese-flavoured-dip.png',
        '/images/roasted-makhana-jar.png',
        '/images/plain-makhana-bowl.png'
      ]
    },
    'cheese-makhana': {
      primary: '/images/cheese-flavoured-dip.png',
      gallery: [
        '/images/cheese-flavoured-dip.png',
        '/images/roasted-makhana-jar.png',
        '/images/plain-makhana-bowl.png'
      ]
    },
    'caramel-jaggery-makhana': {
      primary: '/images/roasted-makhana-jar.png',
      gallery: [
        '/images/roasted-makhana-jar.png',
        '/images/plain-makhana-bowl.png',
        '/images/makhana-seeds-spoon.png'
      ]
    },
    'raw-makhana-seeds': {
      primary: '/images/makhana-seeds-spoon.png',
      gallery: [
        '/images/makhana-seeds-spoon.png',
        '/images/heritage-seeds-burlap.png',
        '/images/plain-makhana-bowl.png'
      ]
    }
  }
};

export default IMAGE_MAP;
