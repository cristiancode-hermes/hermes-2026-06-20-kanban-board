import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  template: `
    <div class="bg-surface-50 dark:bg-surface-800 rounded-xl overflow-hidden animate-pulse">
      <div class="h-2 bg-surface-200 dark:bg-surface-700"></div>
      <div class="p-5 space-y-3">
        <div class="h-5 bg-surface-200 dark:bg-surface-700 rounded w-3/4"></div>
        <div class="h-4 bg-surface-200 dark:bg-surface-700 rounded w-1/2"></div>
        <div class="flex gap-4 pt-2">
          <div class="h-4 bg-surface-200 dark:bg-surface-700 rounded w-20"></div>
          <div class="h-4 bg-surface-200 dark:bg-surface-700 rounded w-16"></div>
        </div>
      </div>
    </div>
  `,
})
export class LoadingSkeletonComponent {}
