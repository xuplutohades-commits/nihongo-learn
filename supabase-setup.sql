-- ============================================================
--  一个月学会基础日语 · Supabase 初始化 SQL
--  在 SQL Editor → New query 中粘贴本文件全部内容后 Run
--  可安全重复执行 (幂等)
-- ============================================================

-- 1) 学习进度表：每个用户一条记录 (user_id 主键，天然隔离)
create table if not exists public.progress (
  user_id   uuid primary key references auth.users(id) on delete cascade,
  done      integer[] not null default '{}',
  updated_at timestamptz not null default now()
);

-- 2) 行级安全：仅本人可读写自己的进度
alter table public.progress enable row level security;

drop policy if exists "progress_select_own" on public.progress;
create policy "progress_select_own"
  on public.progress for select
  using (auth.uid() = user_id);

drop policy if exists "progress_upsert_own" on public.progress;
create policy "progress_upsert_own"
  on public.progress for insert
  with check (auth.uid() = user_id);

drop policy if exists "progress_update_own" on public.progress;
create policy "progress_update_own"
  on public.progress for update
  using (auth.uid() = user_id);

-- 3) 游客 24 小时自动删除：
--    定时清理 "匿名用户 + 其进度" 且 created_at 超过 24 小时的匿名账号。
--    (用 pg_cron 每小时跑一次；匿名用户 created_at 扣掉 now() 超过 24h 即删除)
create or replace function public.cleanup_anonymous_users()
returns void
language sql
security definer
set search_path = public
as $$
  delete from auth.users
  where (created_at < now() - interval '24 hours')
    and (is_anonymous = true or email is null)
    and email_confirmed_at is null;
$$;

-- 4) 若 cron 扩展可用，则注册每小时调度；不可用时忽略(稍后可手动执行)
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule(
      'cleanup-anonymous-hourly',
      '0 * * * *',
      'select public.cleanup_anonymous_users()'
    );
  end if;
end $$;

-- 5) 手动立即清理一次（把已有超24h的游客清掉）
select public.cleanup_anonymous_users();