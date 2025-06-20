/**
 * Interface representing metadata for a Mux video. Should match
 * https://www.mux.com/docs/guides/make-your-data-actionable-with-metadata
 */

export interface MuxMetadata extends HighPriority, Optional, Overridable {}

interface HighPriority {
  env_key: string // From Mux dashboard
  video_id?: string
  video_title?: string
  video_user_id?: string // Unique ID
}

interface Optional {
  experiment_name?: string
  page_type?: string
  player_init_time?: number //Milliseconds since Epoch
  player_name?: string
  player_version?: string
  sub_property_id?: string
  video_cdn?: string
  view_cdn_edge_pop?: string
  view_cdn_origin?: string
  video_content_type?: string
  view_drm_type?: string
  view_drm_level?: string
  video_duration?: number //Milliseconds
  video_encoding_variant?: string
  video_language_code?: string
  video_producer?: string
  video_series?: string
  video_stream_type?: string
  video_variant_name?: string
  video_variant_id?: string
  view_session_id?: string // Unique ID
  view_dropped?: boolean
  client_application_name?: string
  client_application_version?: string
  video_affiliate?: string
  viewer_plan?: string
  viewer_plan_status?: string
  viewer_plan_category?: string
  video_brand?: string
  player_pip_enabled?: string
  view_time_shift_enabled?: string
  player_captions_enabled?: string
  video_codec?: string
  audio_codec?: string
  video_dynamic_range_type?: string
  custom_1?: string
  custom_2?: string
  custom_3?: string
  custom_4?: string
  custom_5?: string
  custom_6?: string
  custom_7?: string
  custom_8?: string
  custom_9?: string
  custom_10?: string
}

interface Overridable {
  browser?: string
  browser_version?: string // Version (e.g. 66.0.3359.158)
  cdn?: string
  operating_system?: string
  operating_system_version?: string
  page_url?: string // URL
  player_autoplay?: boolean
  player_height?: number // Logical pixels
  player_instance_id?: string // Unique ID
  player_language?: string
  player_poster?: string // URL
  player_preload?: boolean
  player_remote_played?: boolean
  player_software_name?: string
  player_software_version?: string
  player_source_height?: number // Pixels
  player_source_width?: number // Pixels
  player_width?: number // Logical pixels
  source_type?: string
  used_fullscreen?: boolean
  viewer_connection_type?: string
  viewer_device_manufacturer?: string
  viewer_device_category?: string
  viewer_device_model?: string
  viewer_device_name?: string
}
