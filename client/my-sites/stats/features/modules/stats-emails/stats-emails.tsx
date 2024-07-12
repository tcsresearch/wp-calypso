import { StatsCard } from '@automattic/components';
import { mail } from '@automattic/components/src/icons';
import { localizeUrl } from '@automattic/i18n-utils';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import { useSelector } from 'calypso/state';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsNormalizedData,
} from 'calypso/state/stats/lists/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import EmptyModuleCard from '../../../components/empty-module-card/empty-module-card';
import { SUPPORT_URL } from '../../../const';
import { useShouldGateStats } from '../../../hooks/use-should-gate-stats';
import StatsModule from '../../../stats-module';
import { StatsEmptyActionEmail } from '../shared';
import StatsCardSkeleton from '../shared/stats-card-skeleton';
import type { StatsDefaultModuleProps, StatsStateProps } from '../types';

const StatsEmails: React.FC< StatsDefaultModuleProps > = ( {
	period,
	query,
	moduleStrings,
	className,
}: StatsDefaultModuleProps ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId ) as number;
	const statType = 'statsEmailsSummary';

	const shouldGateStatsModule = useShouldGateStats( statType );

	const isRequestingData = useSelector( ( state: StatsStateProps ) =>
		isRequestingSiteStatsForQuery( state, siteId, statType, query )
	);
	const data = useSelector( ( state ) =>
		getSiteStatsNormalizedData( state, siteId, statType, query )
	) as [ id: number, label: string ];

	return (
		<>
			{ ! shouldGateStatsModule && siteId && statType && (
				<QuerySiteStats statType={ statType } siteId={ siteId } query={ query } />
			) }
			{ isRequestingData && (
				<StatsCardSkeleton
					isLoading={ isRequestingData }
					className={ className }
					title={ moduleStrings.title }
					type={ 2 }
				/>
			) }
			{ ( ( ! isRequestingData && !! data?.length ) || shouldGateStatsModule ) && (
				<StatsModule
					additionalColumns={ {
						header: (
							<>
								<span>{ translate( 'Opens' ) }</span>
							</>
						),
						body: ( item: { opens: number } ) => (
							<>
								<span>{ item.opens }</span>
							</>
						),
					} }
					path="emails"
					moduleStrings={ moduleStrings }
					period={ period }
					query={ query }
					statType="statsEmailsSummary"
					mainItemLabel={ translate( 'Latest Emails' ) }
					metricLabel={ translate( 'Clicks' ) }
					showSummaryLink
					className={ className }
					hasNoBackground
					skipQuery
				/>
			) }
			{ ! isRequestingData && ! data?.length && ! shouldGateStatsModule && (
				<StatsCard
					className={ clsx( 'stats-card--empty-variant', className ) }
					title={ translate( 'Emails' ) }
					isEmpty
					emptyMessage={
						<EmptyModuleCard
							icon={ mail }
							description={ translate(
								'Your {{link}}latest emails sent{{/link}} will display here to better understand how they performed. Start sending!',
								{
									comment: '{{link}} links to support documentation.',
									components: {
										link: <a href={ localizeUrl( `${ SUPPORT_URL }#emails` ) } />,
									},
									context: 'Stats: Info box label when the Emails module is empty',
								}
							) }
							cards={ <StatsEmptyActionEmail from="module_emails" /> }
						/>
					}
				/>
			) }
		</>
	);
};

export default StatsEmails;
