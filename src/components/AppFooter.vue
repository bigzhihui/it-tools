<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { IconBrandGithub, IconExternalLink, IconMail, IconShieldCheck } from '@tabler/icons-vue';
import { NButton, NIcon, NModal } from 'naive-ui';

const showPrivacyModal = ref(false);
const showContactModal = ref(false);
</script>

<template>
  <footer class="app-footer">
    <div class="footer-inner">
      <!-- 第一行：版权信息 -->
      <div class="copyright">
        © 2025 <a href="https://tools.afeiii.com" target="_blank" rel="noopener noreferrer" class="site-link">tools.afeiii.com</a> All Rights Reserved.
      </div>

      <!-- 第二行：合规与导航链接 -->
      <div class="links">
        <button class="footer-link" @click="showPrivacyModal = true">
          {{ $t('footer.privacyPolicy') }}
        </button>
        <span class="divider">|</span>
        <RouterLink to="/about" class="footer-link">
          {{ $t('footer.about') }}
        </RouterLink>
        <span class="divider">|</span>
        <RouterLink to="/support" class="footer-link">
          {{ $t('footer.support') }}
        </RouterLink>
        <span class="divider">|</span>
        <button class="footer-link" @click="showContactModal = true">
          {{ $t('footer.contact') }}
        </button>
      </div>
    </div>

    <!-- 隐私政策弹窗 -->
    <NModal v-model:show="showPrivacyModal" preset="card" :title="$t('footer.privacyModalTitle')" style="max-width: 560px;" class="privacy-modal">
      <div class="modal-content">
        <div class="modal-item">
          <div class="item-title">
            <NIcon :component="IconShieldCheck" class="mr-1 text-primary" />
            {{ $t('footer.localCompute') }}
          </div>
          <p class="item-desc">
            {{ $t('footer.localComputeDesc') }}
          </p>
        </div>

        <div class="modal-item">
          <div class="item-title">
            {{ $t('footer.zeroUpload') }}
          </div>
          <p class="item-desc">
            {{ $t('footer.zeroUploadDesc') }}
          </p>
        </div>

        <div class="modal-item">
          <div class="item-title">
            {{ $t('footer.openSource') }}
          </div>
          <p class="item-desc">
            {{ $t('footer.openSourceDesc') }}
          </p>
        </div>
      </div>
      <template #footer>
        <div flex justify-end>
          <NButton type="primary" @click="showPrivacyModal = false">
            {{ $t('footer.understood') }}
          </NButton>
        </div>
      </template>
    </NModal>

    <!-- 联系站长弹窗 -->
    <NModal v-model:show="showContactModal" preset="card" :title="$t('footer.contactTitle')" style="max-width: 500px;" class="contact-modal">
      <div class="modal-content">
        <p class="mb-4 text-sm text-neutral-400">
          {{ $t('footer.contactDesc') }}
        </p>

        <div class="contact-card">
          <div class="contact-icon">
            <NIcon size="20" :component="IconMail" />
          </div>
          <div class="contact-info">
            <div class="contact-label">
              {{ $t('footer.officialEmail') }}
            </div>
            <a href="mailto:support@afeiii.com" class="contact-value">support@afeiii.com</a>
          </div>
        </div>

        <div class="contact-card mt-3">
          <div class="contact-icon">
            <NIcon size="20" :component="IconBrandGithub" />
          </div>
          <div class="contact-info">
            <div class="contact-label">
              {{ $t('footer.githubRepo') }}
            </div>
            <a href="https://github.com/bigzhihui/it-tools" target="_blank" rel="noopener noreferrer" class="contact-value flex items-center">
              github.com/bigzhihui/it-tools
              <NIcon size="14" :component="IconExternalLink" class="ml-1" />
            </a>
          </div>
        </div>
      </div>
      <template #footer>
        <div flex justify-end>
          <NButton type="primary" @click="showContactModal = false">
            {{ $t('common.close') }}
          </NButton>
        </div>
      </template>
    </NModal>
  </footer>
</template>

<style scoped lang="less">
.app-footer {
  width: 100%;
  margin-top: 48px;
  padding: 24px 16px 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-top: 1px solid rgba(128, 128, 128, 0.12);

  .footer-inner {
    text-align: center;
    font-size: 13px;
    line-height: 1.8;
  }

  .copyright {
    color: rgba(128, 128, 128, 0.85);
    margin-bottom: 6px;

    .site-link {
      color: inherit;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s ease;

      &:hover {
        color: #1ea54c;
      }
    }
  }

  .links {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    color: rgba(128, 128, 128, 0.7);

    .divider {
      opacity: 0.4;
      font-size: 12px;
      user-select: none;
    }

    .footer-link {
      background: none;
      border: none;
      padding: 0;
      color: rgba(128, 128, 128, 0.85);
      font-size: 13px;
      cursor: pointer;
      text-decoration: none;
      transition: color 0.2s ease;

      &:hover {
        color: #1ea54c;
      }
    }
  }
}

.modal-content {
  .modal-item {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }

    .item-title {
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
    }

    .item-desc {
      font-size: 13px;
      line-height: 1.6;
      color: rgba(128, 128, 128, 0.9);
      margin: 0;
    }
  }
}

.contact-card {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: rgba(128, 128, 128, 0.08);
  border-radius: 8px;
  border: 1px solid rgba(128, 128, 128, 0.12);

  .contact-icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(30, 165, 76, 0.12);
    color: #1ea54c;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    flex-shrink: 0;
  }

  .contact-info {
    flex: 1;

    .contact-label {
      font-size: 12px;
      color: rgba(128, 128, 128, 0.75);
    }

    .contact-value {
      font-size: 14px;
      color: inherit;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;

      &:hover {
        color: #1ea54c;
      }
    }
  }
}
</style>
