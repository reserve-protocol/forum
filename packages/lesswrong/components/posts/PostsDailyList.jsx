import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { FormattedMessage } from 'meteor/vulcan:i18n';
import { Posts } from '../../lib/collections/posts';
import { withCurrentUser, withList, getSetting, Components, getRawComponent, registerComponent } from 'meteor/vulcan:core';

class PostsDailyList extends PureComponent {

  constructor(props) {
    super(props);
    this.loadMoreDays = this.loadMoreDays.bind(this);
    this.state = {
      days: props.days,
      after: props.terms.after,
      daysLoaded: props.days,
      afterLoaded: props.terms.after,
      before: props.terms.before,
      loading: true,
    };
  }

  // intercept prop change and only show more days once data is done loading
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.networkStatus === 2) {
      this.setState({loading: true});
    } else {
      this.setState((prevState, props) => ({
        loading: false,
        daysLoaded: prevState.days,
        afterLoaded: prevState.after,
      }));
    }
  }

  // return date objects for all the dates in a range
  getDateRange(after, before) {
    const mAfter = moment.utc(after, 'YYYY-MM-DD').local();
    const mBefore = moment.utc(before, 'YYYY-MM-DD').local();
    const daysCount = mBefore.diff(mAfter, 'days') + 1;
    const range = _.range(daysCount).map(
      i => moment.utc(before, 'YYYY-MM-DD').local().subtract(i, 'days').startOf('day')
    );
    return range;
  }

  getDatePosts(posts, date) {
    const { timeField } = this.props.terms
    return _.filter(posts, post => moment(new Date(timeField ? post[timeField] : post.postedAt)).startOf('day').isSame(date, 'day'));
  }

  // variant 1: reload everything each time (works with polling)
  loadMoreDays(e) {
    e.preventDefault();
    const numberOfDays = getSetting('forum.numberOfDays', 5);
    const loadMoreAfter = moment(this.state.after, 'YYYY-MM-DD').subtract(numberOfDays, 'days').format('YYYY-MM-DD');

    this.props.loadMore({
      ...this.props.terms,
      after: loadMoreAfter,
    });

    this.setState({
      days: this.state.days + this.props.increment,
      after: loadMoreAfter,
    });
  }

  // variant 2: only load new data (need to disable polling)
  loadMoreDaysInc(e) {
    e.preventDefault();
    const numberOfDays = getSetting('forum.numberOfDays', 5);
    const loadMoreAfter = moment(this.state.after, 'YYYY-MM-DD').subtract(numberOfDays, 'days').format('YYYY-MM-DD');
    const loadMoreBefore = moment(this.state.after, 'YYYY-MM-DD').subtract(1, 'days').format('YYYY-MM-DD');

    this.props.loadMoreInc({
      ...this.props.terms,
      before: loadMoreBefore,
      after: loadMoreAfter,
    });

    this.setState({
      days: this.state.days + this.props.increment,
      after: loadMoreAfter,
    });
  }

  render() {
    const posts = this.props.results;
    const dates = this.getDateRange(this.state.afterLoaded, this.state.before);

    if (this.props.loading && (!posts || !posts.length)) {
      return <Components.PostsLoading />
    } else {
      return (
        <div className="posts-daily">
          {/* <Components.PostsListHeader /> */}
          {dates.map((date, index) => <Components.PostsDay key={index} number={index} date={date} posts={this.getDatePosts(posts, date)} networkStatus={this.props.networkStatus} currentUser={this.props.currentUser} />)}
          {this.state.loading? <Components.PostsLoading /> : <a className="posts-load-more posts-load-more-days" onClick={this.loadMoreDays}><FormattedMessage id="posts.load_more_days"/></a>}
        </div>
      )
    }
  }
}

PostsDailyList.propTypes = {
  currentUser: PropTypes.object,
  days: PropTypes.number,
  increment: PropTypes.number
};

PostsDailyList.defaultProps = {
  days: getSetting('forum.numberOfDays', 5),
  increment: getSetting('forum.numberOfDays', 5)
};

const options = {
  collection: Posts,
  queryName: 'postsDailyListQuery',
  fragmentName: 'PostsList',
  limit: 0,
  ssr: true,
};

registerComponent('PostsDailyList', PostsDailyList, withCurrentUser, [withList, options]);