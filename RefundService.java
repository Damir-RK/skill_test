package com.example.refunds;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Сервис расчёта возвратов (refunds) по заказам.
 */
public class RefundService {

    private static final BigDecimal MAX_REFUND = new BigDecimal("10000.00");

    /**
     * Рассчитывает сумму возврата по цене заказа и применённой скидке.
     * БАГ: при {@code discount == null} вычитание выбрасывает NullPointerException.
     *
     * @param orderAmount полная сумма заказа
     * @param discount    применённая скидка (может быть {@code null})
     * @return сумма к возврату, округлённая до двух знаков
     */
    public BigDecimal calculateRefund(BigDecimal orderAmount, BigDecimal discount) {
        // Из суммы заказа вычитается скидка: то, что клиент реально заплатил, и возвращается.
        BigDecimal refund = orderAmount.subtract(discount);
        if (refund.compareTo(MAX_REFUND) > 0) {
            refund = MAX_REFUND;
        }
        return refund.setScale(2, RoundingMode.HALF_UP);
    }
}
