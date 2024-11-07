import { __ } from '@wordpress/i18n';
import { useSelector } from 'react-redux';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { SidebarItem, Sidebar, PanelWithSidebar } from '../components/panel-sidebar';
import {
	useAreAdvancedHostingFeaturesSupported,
	useAreHostingFeaturesSupported,
} from '../features';
import AdministrationSettings from './administration';
import useIsAdministrationSettingSupported from './administration/hooks/use-is-administration-setting-supported';
import AgencySettings from './agency';
import useIsAgencySettingSupported from './agency/hooks/use-is-agency-setting-supported';
import CachesSettings from './caches/page';
import SiteSettings from './site';
import WebServerSettings from './web-server/page';
import type { Context as PageJSContext } from '@automattic/calypso-router';

export function SettingsSidebar() {
	const slug = useSelector( getSelectedSiteSlug );

	const shouldShowAdministration = useIsAdministrationSettingSupported();
	const shouldShowAgency = useIsAgencySettingSupported();

	const shouldShowHostingFeatures = useAreHostingFeaturesSupported();
	const shouldShowAdvancedHostingFeatures = useAreAdvancedHostingFeaturesSupported();

	return (
		<Sidebar>
			<SidebarItem href={ `/sites/settings/site/${ slug }` }>{ __( 'Site' ) }</SidebarItem>
			<SidebarItem
				enabled={ shouldShowAdministration }
				href={ `/sites/settings/administration/${ slug }` }
			>
				{ __( 'Administration' ) }
			</SidebarItem>
			<SidebarItem enabled={ shouldShowAgency } href={ `/sites/settings/agency/${ slug }` }>
				{ __( 'Agency' ) }
			</SidebarItem>
			<SidebarItem
				enabled={ shouldShowHostingFeatures }
				href={ `/sites/settings/caches/${ slug }` }
			>
				{ __( 'Caches' ) }
			</SidebarItem>
			<SidebarItem
				enabled={ !! shouldShowAdvancedHostingFeatures }
				href={ `/sites/settings/web-server/${ slug }` }
			>
				{ __( 'Web server' ) }
			</SidebarItem>
		</Sidebar>
	);
}

export function siteSettings( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<SettingsSidebar />
			<SiteSettings />
		</PanelWithSidebar>
	);
	next();
}

export function administrationSettings( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<SettingsSidebar />
			<AdministrationSettings />
		</PanelWithSidebar>
	);
	next();
}

export function agencySettings( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<SettingsSidebar />
			<AgencySettings />
		</PanelWithSidebar>
	);
	next();
}

export function cachesSettings( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<SettingsSidebar />
			<CachesSettings />
		</PanelWithSidebar>
	);
	next();
}

export function webServerSettings( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<SettingsSidebar />
			<WebServerSettings />
		</PanelWithSidebar>
	);
	next();
}
