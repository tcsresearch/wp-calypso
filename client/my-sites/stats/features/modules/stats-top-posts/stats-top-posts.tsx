import { StatsCard } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { trendingUp } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsNormalizedData,
} from 'calypso/state/stats/lists/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import EmptyModuleCard from '../../../components/empty-module-card/empty-module-card';
import { SUPPORT_URL } from '../../../const';
import StatsModule from '../../../stats-module';
import StatsModulePlaceholder from '../../../stats-module/placeholder';
import { StatsEmptyActionAI, StatsEmptyActionSocial } from '../shared';

type StatsTopPostsProps = {
	className?: string;
	period: string;
	query: {
		date: string;
		period: string;
	};
	moduleStrings: {
		title: string;
		item: string;
		value: string;
		empty: string;
	};
};

const StatsTopPosts: React.FC< StatsTopPostsProps > = ( {
	period,
	query,
	moduleStrings,
	className,
} ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId ) as number;
	const statType = 'statsTopPosts';

	// TODO: sort out the state shape.
	const requesting = useSelector( ( state: any ) =>
		isRequestingSiteStatsForQuery( state, siteId, statType, query )
	);
	const data = useSelector( ( state ) =>
		getSiteStatsNormalizedData( state, siteId, statType, query )
	) as [ id: number, label: string ]; // TODO: get post shape and share in an external type file.

	return (
		<>
			{ siteId && statType && (
				<QuerySiteStats statType={ statType } siteId={ siteId } query={ query } />
			) }
			{ /* This will be replaced with ghost loaders, fallback to the current implementation until then. */ }
			{ requesting && <StatsModulePlaceholder isLoading={ requesting } /> }
			{ ( ! data || ! data?.length ) && (
				<StatsCard
					className={ clsx( 'stats-card--empty-variant', className ) } // when removing stats/empty-module-traffic add this to the root of the card
					title={ moduleStrings.title }
					isEmpty
					emptyMessage={
						<EmptyModuleCard
							icon={ trendingUp }
							description={ translate(
								'Your top {{link}}posts and pages{{/link}} will display here and learn what content resonates the most. Start creating and sharing!',
								{
									comment: '{{link}} links to support documentation.',
									components: {
										link: <a href={ localizeUrl( `${ SUPPORT_URL }#posts-amp-pages` ) } />,
									},
									context: 'Stats: Info box label when the Posts & Pages module is empty',
								}
							) }
							cards={
								<>
									<StatsEmptyActionAI from="module_top_posts" />
									<StatsEmptyActionSocial from="module_top_posts" />
								</>
							}
						/>
					}
				/>
			) }
			{ /* TODO: consider supressing <StatsModule /> empty state */ }
			{ data && !! data.length && (
				<StatsModule
					path="posts"
					moduleStrings={ moduleStrings }
					period={ period }
					query={ query }
					statType={ statType }
					showSummaryLink
					className={ className } // TODO: extend with a base class after adding skeleton loaders
				/>
			) }
		</>
	);
};

export default StatsTopPosts;