<template>
  <div class="login-page">
    <section class="login-panel" aria-label="后台登录">
      <div class="login-brand">
        <HeaderLogo variant="geom" />
      </div>

      <div class="login-copy">
        <strong>登录后台</strong>
        <span>使用企业账号进入运营工作台。</span>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <label class="login-field">
          <span>账号</span>
          <input
            v-model.trim="account"
            class="login-input"
            type="text"
            placeholder="输入手机号或工号"
          >
        </label>

        <label class="login-field">
          <span>密码</span>
          <input
            v-model="password"
            class="login-input"
            type="password"
            placeholder="输入登录密码"
          >
        </label>

        <div class="login-meta">
          <label class="login-check">
            <UiCheckbox v-model="remember">记住登录状态</UiCheckbox>
          </label>
          <button class="login-link" type="button">忘记密码</button>
        </div>

        <UiButton class="login-submit" variant="primary" type="submit">登录</UiButton>
      </form>

      <div class="login-tip">
        <span>演示账号：`admin-demo` / 任意密码</span>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import HeaderLogo from '../components/HeaderLogo.vue'
import UiButton from '../components/UiButton.vue'
import UiCheckbox from '../components/UiCheckbox.vue'

const router = useRouter()
const account = ref('admin-demo')
const password = ref('')
const remember = ref(true)

function handleLogin() {
  router.push('/')
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  padding: 32px 20px;
  display: grid;
  place-items: center;
}

.login-panel {
  width: min(100%, 420px);
  padding: 32px 30px 28px;
  border: 1px solid var(--line);
  border-radius: 8px;
  display: grid;
  gap: 24px;
  background: color-mix(in srgb, var(--surface-strong) 92%, white 8%);
  box-shadow: 0 20px 50px color-mix(in srgb, var(--text) 10%, transparent 90%);
}

.login-brand {
  display: flex;
  justify-content: center;
}

.login-copy {
  display: grid;
  gap: 8px;
  text-align: center;
}

.login-copy strong {
  font-size: 1.4rem;
  line-height: 1.2;
}

.login-copy span,
.login-tip {
  color: var(--muted);
  font-size: 0.86rem;
}

.login-form {
  display: grid;
  gap: 18px;
}

.login-field {
  display: grid;
  gap: 8px;
}

.login-field span {
  font-size: 0.82rem;
  color: var(--muted);
}

.login-input {
  min-height: 42px;
  padding: 0 14px;
  border: 1px solid var(--line);
  border-radius: 4px;
  color: var(--text);
  background: color-mix(in srgb, var(--surface) 72%, white 28%);
}

.login-input:focus {
  outline: none;
  border-color: color-mix(in srgb, var(--accent) 38%, transparent 62%);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 10%, transparent 90%);
}

.login-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.login-check {
  display: inline-flex;
  align-items: center;
  min-width: 0;
}

.login-link {
  padding: 0;
  border: 0;
  color: var(--accent-deep);
  font-size: 0.8rem;
  background: transparent;
  cursor: pointer;
}

.login-submit {
  width: 100%;
}

.login-tip {
  text-align: center;
}

@media (max-width: 560px) {
  .login-page {
    padding: 16px;
  }

  .login-panel {
    padding: 24px 18px 20px;
    gap: 20px;
  }

  .login-copy strong {
    font-size: 1.22rem;
  }

  .login-meta {
    flex-wrap: wrap;
    justify-content: space-between;
  }
}
</style>
