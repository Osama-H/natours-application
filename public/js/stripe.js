import axios from 'axios';
import { showAlert } from './alert';

// Jonas Code

// export const bookTour = async (tourId) => {
//   const stripe = Stripe(
//     'pk_test_51NswuqEkTezArKfwvLcVWjJ1EfZpVoTyUml5sQiNoijLt3WAiaongEYBEptYI3HyVPXP5Bqw3AWHkO9JiHMarOcC00HIMPntqC'
//   );
//   try {
//     // 1) Get the session from API

//     const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
//     console.log(session);

//     // 2) Create checkout form + charge credit card
//     await stripe.redirectToCheckout({
//       sessionId: session.data.session.id,
//     });

//     // 3) Send the checkout session to the client
//   } catch (err) {
//     console.log(err);
//     showAlert('error', err);
//   }
// };

export const bookTour = async (tourId) => {
  try {
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    console.log(session);

    //await stripe.redirectToCheckout({
    //  sessionId: session.data.session.id,
    //});

    //works as expected
    window.location.replace(session.data.session.url);
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
