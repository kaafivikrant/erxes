import apolloClient from 'apolloClient';
import { AppConsumer } from 'appContext';
import gql from 'graphql-tag';
import withCurrentUser from 'modules/auth/containers/withCurrentUser';
import { IUser } from 'modules/auth/types';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { withProps } from '../../common/utils';
import Onboarding from '../components/Onboarding';
import { FEATURE_DETAILS } from '../constants';
import { mutations, queries, subscriptions } from '../graphql';
import { IFeature } from '../types';

type Props = {};

type FinalProps = Props & {
  getAvailableFeaturesQuery?: any;
  forceCompleteMutation: any;
  currentUser: IUser;
};

class OnboardingContainer extends React.Component<
  FinalProps,
  { currentStep?: string }
> {
  constructor(props: FinalProps) {
    super(props);

    this.state = { currentStep: undefined };
  }

  changeStep = (step: string) => {
    const { getAvailableFeaturesQuery } = this.props;

    if (step === 'featureList' && getAvailableFeaturesQuery) {
      getAvailableFeaturesQuery.refetch();
    }

    this.setState({ currentStep: step });
  };

  forceComplete = () => {
    this.props.forceCompleteMutation().then(() => {
      this.setState({ currentStep: '' });
    });
  };

  componentDidMount() {
    if (window.location.href.includes('signedIn=true')) {
      setTimeout(() => {
        apolloClient.mutate({
          mutation: gql(mutations.checkStatus)
        });
      }, 1000);
    }
  }

  componentWillMount() {
    const { getAvailableFeaturesQuery, currentUser } = this.props;

    if (!getAvailableFeaturesQuery) {
      return;
    }

    getAvailableFeaturesQuery.subscribeToMore({
      document: gql(subscriptions.onboardingChanged),
      variables: { userId: currentUser._id },
      updateQuery: (prev, { subscriptionData: { data } }) => {
        const { onboardingChanged } = data;

        if (onboardingChanged) {
          const { type } = onboardingChanged;

          if (
            ['initial', 'inComplete'].includes(type) &&
            !this.state.currentStep
          ) {
            this.setState({ currentStep: type });
          }
        }
      }
    });
  }

  render() {
    const { currentStep } = this.state;
    const { getAvailableFeaturesQuery } = this.props;

    const availableFeatures: IFeature[] = (getAvailableFeaturesQuery
      ? getAvailableFeaturesQuery.onboardingGetAvailableFeatures || []
      : []
    ).map(feature => {
      const details = FEATURE_DETAILS[feature.name] || {};

      return {
        ...feature,
        ...details
      };
    });

    return (
      <AppConsumer>
        {({ currentUser }) =>
          currentUser && (
            <Onboarding
              currentUser={currentUser}
              currentStep={currentStep}
              changeStep={this.changeStep}
              forceComplete={this.forceComplete}
              availableFeatures={availableFeatures}
            />
          )
        }
      </AppConsumer>
    );
  }
}

export default withProps<Props>(
  compose(
    graphql<{}>(gql(queries.getAvailableFeatures), {
      name: 'getAvailableFeaturesQuery'
    }),
    graphql<{}>(gql(mutations.forceComplete), {
      name: 'forceCompleteMutation'
    })
  )(withCurrentUser(OnboardingContainer))
);