-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.auctions (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  player_id bigint NOT NULL,
  current_price integer DEFAULT 1,
  current_winner_team_id uuid,
  end_time timestamp with time zone NOT NULL,
  status text DEFAULT 'OPEN'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT auctions_pkey PRIMARY KEY (id),
  CONSTRAINT auctions_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id),
  CONSTRAINT auctions_current_winner_team_id_fkey FOREIGN KEY (current_winner_team_id) REFERENCES public.teams(id)
);
CREATE TABLE public.fixtures (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  league_id uuid,
  matchday integer NOT NULL,
  home_team_id uuid,
  away_team_id uuid,
  home_goals integer DEFAULT 0,
  away_goals integer DEFAULT 0,
  calculated boolean DEFAULT false,
  CONSTRAINT fixtures_pkey PRIMARY KEY (id),
  CONSTRAINT fixtures_league_id_fkey FOREIGN KEY (league_id) REFERENCES public.leagues(id),
  CONSTRAINT fixtures_home_team_id_fkey FOREIGN KEY (home_team_id) REFERENCES public.teams(id),
  CONSTRAINT fixtures_away_team_id_fkey FOREIGN KEY (away_team_id) REFERENCES public.teams(id)
);
CREATE TABLE public.leagues (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  CONSTRAINT leagues_pkey PRIMARY KEY (id)
);
CREATE TABLE public.lineup_players (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  lineup_id bigint NOT NULL,
  player_id bigint NOT NULL,
  is_starter boolean DEFAULT false,
  bench_order integer DEFAULT 0,
  CONSTRAINT lineup_players_pkey PRIMARY KEY (id),
  CONSTRAINT lineup_players_lineup_id_fkey FOREIGN KEY (lineup_id) REFERENCES public.lineups(id),
  CONSTRAINT lineup_players_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id)
);
CREATE TABLE public.lineups (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  fixture_id bigint NOT NULL,
  team_id uuid NOT NULL,
  module text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lineups_pkey PRIMARY KEY (id),
  CONSTRAINT lineups_fixture_id_fkey FOREIGN KEY (fixture_id) REFERENCES public.fixtures(id),
  CONSTRAINT lineups_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id)
);
CREATE TABLE public.logs (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid,
  action text NOT NULL,
  details jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT logs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.match_stats (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  player_id bigint NOT NULL,
  matchday integer NOT NULL,
  vote double precision,
  goals_for integer DEFAULT 0,
  goals_against integer DEFAULT 0,
  assists integer DEFAULT 0,
  yellow_cards integer DEFAULT 0,
  red_cards integer DEFAULT 0,
  penalties_saved integer DEFAULT 0,
  penalties_missed integer DEFAULT 0,
  own_goals integer DEFAULT 0,
  CONSTRAINT match_stats_pkey PRIMARY KEY (id),
  CONSTRAINT match_stats_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id)
);
CREATE TABLE public.players (
  id bigint NOT NULL,
  name text NOT NULL,
  role text NOT NULL,
  team_real text NOT NULL,
  quotation integer DEFAULT 1,
  CONSTRAINT players_pkey PRIMARY KEY (id)
);
CREATE TABLE public.rosters (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  team_id uuid NOT NULL,
  player_id bigint NOT NULL,
  purchase_price integer DEFAULT 0,
  CONSTRAINT rosters_pkey PRIMARY KEY (id),
  CONSTRAINT rosters_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id),
  CONSTRAINT rosters_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id)
);
CREATE TABLE public.settings (
  key text NOT NULL,
  value text NOT NULL,
  CONSTRAINT settings_pkey PRIMARY KEY (key)
);
CREATE TABLE public.teams (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  league_id uuid,
  name text NOT NULL,
  credits_left integer DEFAULT 1000,
  created_at timestamp with time zone DEFAULT now(),
  password text,
  CONSTRAINT teams_pkey PRIMARY KEY (id),
  CONSTRAINT teams_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT teams_league_id_fkey FOREIGN KEY (league_id) REFERENCES public.leagues(id)
);
CREATE TABLE public.trade_proposals (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  proposer_team_id uuid NOT NULL,
  receiver_team_id uuid NOT NULL,
  proposer_player_ids ARRAY DEFAULT '{}'::bigint[],
  receiver_player_ids ARRAY DEFAULT '{}'::bigint[],
  proposer_credits integer DEFAULT 0,
  receiver_credits integer DEFAULT 0,
  status text DEFAULT 'PENDING'::text CHECK (status = ANY (ARRAY['PENDING'::text, 'ACCEPTED'::text, 'REJECTED'::text, 'CANCELLED'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT trade_proposals_pkey PRIMARY KEY (id),
  CONSTRAINT trade_proposals_proposer_team_id_fkey FOREIGN KEY (proposer_team_id) REFERENCES public.teams(id),
  CONSTRAINT trade_proposals_receiver_team_id_fkey FOREIGN KEY (receiver_team_id) REFERENCES public.teams(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL,
  email text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);