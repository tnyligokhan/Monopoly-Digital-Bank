-- Kullanıcılar tablosu
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  photo_url TEXT,
  current_game_id TEXT,
  played_game_results JSONB DEFAULT '[]'::jsonb,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Kullanıcı adları tablosu (benzersizlik user_id ile sağlanır)
CREATE TABLE usernames (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Oyunlar tablosu
CREATE TABLE games (
  id TEXT PRIMARY KEY,
  starting_capital INTEGER NOT NULL,
  salary INTEGER NOT NULL,
  enable_free_parking BOOLEAN NOT NULL DEFAULT false,
  free_parking_money INTEGER NOT NULL DEFAULT 0,
  players JSONB NOT NULL DEFAULT '[]'::jsonb,
  transaction_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  starting_timestamp TIMESTAMP WITH TIME ZONE,
  ending_timestamp TIMESTAMP WITH TIME ZONE,
  winner_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeksler
CREATE INDEX idx_users_current_game ON users(current_game_id);
CREATE INDEX idx_usernames_username ON usernames(username);
CREATE INDEX idx_usernames_user_id ON usernames(user_id);
CREATE INDEX idx_games_winner ON games(winner_id);
CREATE INDEX idx_games_ending_timestamp ON games(ending_timestamp);

-- Realtime için yayınları etkinleştir
ALTER PUBLICATION supabase_realtime ADD TABLE games;

-- Row Level Security (RLS) Politikaları

-- Users tablosu
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanıcılar kendi kayıtlarını okuyabilir"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Kullanıcılar kendi kayıtlarını oluşturabilir"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Kullanıcılar kendi kayıtlarını güncelleyebilir"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Kullanıcılar kendi kayıtlarını silebilir"
  ON users FOR DELETE
  USING (auth.uid() = id);

-- Usernames tablosu
ALTER TABLE usernames ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes kullanıcı adlarını okuyabilir"
  ON usernames FOR SELECT
  USING (true);

CREATE POLICY "Kullanıcılar kendi kullanıcı adlarını oluşturabilir"
  ON usernames FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi kullanıcı adlarını güncelleyebilir"
  ON usernames FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi kullanıcı adlarını silebilir"
  ON usernames FOR DELETE
  USING (auth.uid() = user_id);

-- Games tablosu
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Games tablosu
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanıcılar dahil oldukları veya lobi aşamasındaki oyunları okuyabilir"
  ON games FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      players @> jsonb_build_array(jsonb_build_object('user_id', auth.uid()))
      OR starting_timestamp IS NULL
    )
  );

CREATE POLICY "Kullanıcılar lobi oluşturabilir"
  ON games FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Kullanıcılar dahil oldukları oyunları güncelleyebilir"
  ON games FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND (
      players @> jsonb_build_array(jsonb_build_object('user_id', auth.uid()))
      OR starting_timestamp IS NULL
    )
  );

CREATE POLICY "Sadece oyun kurucusu oyunu silebilir"
  ON games FOR DELETE
  USING (
    players @> jsonb_build_array(jsonb_build_object('user_id', auth.uid(), 'is_game_creator', true))
  );

-- Trigger'lar (updated_at otomatik güncelleme)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usernames_updated_at
  BEFORE UPDATE ON usernames
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
