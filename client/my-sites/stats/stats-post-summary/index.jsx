import { SegmentedControl } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryPostStats from 'calypso/components/data/query-post-stats';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import { getPostStats, isRequestingPostStats } from 'calypso/state/stats/posts/selectors';
import StatsModuleUTM from '../features/modules/stats-utm';
import { StatsGlobalValuesContext } from '../pages/providers/global-provider';
import DatePicker from '../stats-date-picker';
import StatsPeriodHeader from '../stats-period-header';
import StatsPeriodNavigation from '../stats-period-navigation';
import SummaryChart from '../stats-summary';

import './style.scss';

function* statsByMonth( stats, moment ) {
	for ( const year of Object.keys( stats.years ) ) {
		for ( let month = 1; month <= 12; month++ ) {
			const firstDayOfMonth = moment( `1/${ month }/${ year }`, 'DD/MM/YYYY' );
			yield {
				period: firstDayOfMonth.format( 'MMM YYYY' ),
				periodLabel: firstDayOfMonth.format( 'MMMM YYYY' ),
				value: stats.years[ year ]?.months[ month ] ?? 0,
			};
		}
	}
}

class StatsPostSummary extends Component {
	static propTypes = {
		postId: PropTypes.number,
		siteId: PropTypes.number,
		translate: PropTypes.func,
		supportsUTMStats: PropTypes.bool,
	};

	state = {
		selectedRecord: null,
		period: 'day',
	};

	selectPeriod( period ) {
		return () =>
			this.setState( {
				selectedRecord: null,
				period,
			} );
	}

	selectRecord = ( record ) => {
		this.setState( { selectedRecord: record } );
	};

	getChartData() {
		const { moment, stats } = this.props;
		if ( ! stats ) {
			return [];
		}

		switch ( this.state.period ) {
			case 'day':
				if ( ! stats.data ) {
					return [];
				}

				return stats.data
					.slice( Math.max( stats.data.length - 10, 0 ) )
					.map( ( [ date, value ] ) => {
						const momentDate = moment( date );
						return {
							period: momentDate.format( 'MMM D' ),
							periodLabel: momentDate.format( 'LL' ),
							startDate: date,
							value,
						};
					} );
			case 'year':
				if ( ! stats.years ) {
					return [];
				}

				return Object.keys( stats.years ).map( ( year ) => {
					return {
						period: year,
						periodLabel: year,
						value: stats.years[ year ].total,
					};
				} );
			case 'month': {
				if ( ! stats.years ) {
					return [];
				}

				const months = [ ...statsByMonth( stats, moment ) ];
				const firstNotEmpty = months.findIndex( ( item ) => item.value !== 0 );
				const reverseLastNotEmpty = [ ...months ]
					.reverse()
					.findIndex( ( item ) => item.value !== 0 );
				const lastNotEmpty =
					reverseLastNotEmpty === -1
						? reverseLastNotEmpty
						: months.length - ( reverseLastNotEmpty + 1 );

				return months.slice( firstNotEmpty, lastNotEmpty + 1 );
			}
			case 'week':
				if ( ! stats.weeks ) {
					return [];
				}

				return stats.weeks.map( ( week ) => {
					const firstDay = moment( week.days[ 0 ].day );
					return {
						period: firstDay.format( 'MMM D' ),
						periodLabel: firstDay.format( 'L' ) + ' - ' + firstDay.add( 6, 'days' ).format( 'L' ),
						startDate: moment( week.days[ 0 ].day ).format( 'YYYY/MM/DD' ),
						value: week.total,
					};
				} );
			default:
				return [];
		}
	}

	getQuery() {
		let selectedRecord = this.state.selectedRecord;
		const { period } = this.state;
		const { moment } = this.props;
		const query = {
			period,
			max: 0,
		};

		if ( ! selectedRecord ) {
			const chartData = this.getChartData();

			if ( chartData.length ) {
				selectedRecord = chartData[ chartData.length - 1 ];
			} else {
				return query;
			}
		}

		let date = selectedRecord.startDate;

		switch ( period ) {
			case 'week':
				date = moment( date ).add( 6, 'days' ).format( 'YYYY/MM/DD' );
				break;
			case 'month':
				date = moment( date ).endOf( 'month' ).format( 'YYYY/MM/DD' );
				break;
			case 'year':
				date = moment( date ).endOf( 'year' ).format( 'YYYY/MM/DD' );
				break;
			case 'day':
			default:
				break;
		}

		return {
			...query,
			date,
		};
	}

	render() {
		const { isRequesting, postId, siteId, translate } = this.props;
		const periods = [
			{ id: 'day', label: translate( 'Days' ) },
			{ id: 'week', label: translate( 'Weeks' ) },
			{ id: 'month', label: translate( 'Months' ) },
			{ id: 'year', label: translate( 'Years' ) },
		];
		const chartData = this.getChartData();
		let selectedRecord = this.state.selectedRecord;
		if ( ! this.state.selectedRecord && chartData.length ) {
			selectedRecord = chartData[ chartData.length - 1 ];
		}

		const summaryWrapperClass = clsx( 'stats-post-summary', 'is-chart-tabs', {
			'is-period-year': this.state.period === 'year',
		} );

		return (
			<>
				<div className={ summaryWrapperClass }>
					<QueryPostStats siteId={ siteId } postId={ postId } />

					<StatsPeriodHeader>
						<StatsPeriodNavigation showArrows={ false }>
							<DatePicker period={ this.state.period } date={ selectedRecord?.startDate } isShort />
						</StatsPeriodNavigation>
						<SegmentedControl primary>
							{ periods.map( ( { id, label } ) => (
								<SegmentedControl.Item
									key={ id }
									onClick={ this.selectPeriod( id ) }
									selected={ this.state.period === id }
								>
									{ label }
								</SegmentedControl.Item>
							) ) }
						</SegmentedControl>
					</StatsPeriodHeader>

					<SummaryChart
						isLoading={ isRequesting && ! chartData.length }
						data={ chartData }
						activeKey="period"
						dataKey="value"
						labelKey="periodLabel"
						chartType="views"
						sectionClass="is-views"
						selected={ selectedRecord }
						onClick={ this.selectRecord }
						tabLabel={ translate( 'Views' ) }
						type="post"
					/>
				</div>

				<StatsGlobalValuesContext.Consumer>
					{ ( isInternal ) =>
						( this.props.supportsUTMStats || isInternal ) && (
							<div className="stats-module-utm__post-detail">
								<StatsModuleUTM
									siteId={ siteId }
									postId={ postId }
									period={ this.state.period }
									query={ this.getQuery() }
								/>
							</div>
						)
					}
				</StatsGlobalValuesContext.Consumer>
			</>
		);
	}
}

export default connect( ( state, { siteId, postId } ) => ( {
	stats: getPostStats( state, siteId, postId ),
	isRequesting: isRequestingPostStats( state, siteId, postId ),
} ) )( localize( withLocalizedMoment( StatsPostSummary ) ) );
