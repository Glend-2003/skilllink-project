package cr.una.skilllink.payment_service.Controller;

import cr.una.skilllink.payment_service.Dto.SubscriptionRequestDto;
import cr.una.skilllink.payment_service.Entity.ProviderSubscription;
import cr.una.skilllink.payment_service.Entity.SubscriptionPlan;
import cr.una.skilllink.payment_service.Entity.Transaction;
import cr.una.skilllink.payment_service.Services.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @GetMapping("/plans")
    public ResponseEntity<List<SubscriptionPlan>> getAllPlans() {
        List<SubscriptionPlan> plans = paymentService.getAllPlans();
        return ResponseEntity.ok(plans);
    }

    @PostMapping("/subscribe")
    public ResponseEntity<?> subscribeProvider(@RequestBody SubscriptionRequestDto request) {
        try {
            ProviderSubscription subscription = paymentService.subscribeProvider(request);
            return ResponseEntity.ok(subscription);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error procesando la suscripción");
        }
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<Transaction>> getUserTransactions(@PathVariable Long userId) {
        List<Transaction> transactions = paymentService.getTransactionsByUser(userId);
        return ResponseEntity.ok(transactions);
    }
}